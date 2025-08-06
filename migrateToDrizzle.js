import pkg from 'pg';
const { Client } = pkg;

const typeormClient = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'eee_inventory',
    password: 'postgres',
    port: 5432,
});

const drizzleClient = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
});

async function connect() {
    await typeormClient.connect();
    await drizzleClient.connect();
}

async function insertIntoDrizzle(schema, data) {
    const query = `INSERT INTO ${schema} (${Object.keys(data).join(', ')}) VALUES (${Object.values(data).map((_, index) => `$${index + 1}`).join(', ')})`;
    await drizzleClient.query(query, Object.values(data));
}

async function migrate() {
    await connect();
    await drizzleClient.query('BEGIN');
    try {

        await drizzleClient.query(`DELETE FROM vendor_categories`);
        await drizzleClient.query(`DELETE FROM inventory_items`);
        await drizzleClient.query(`DELETE FROM inventory_vendors`);
        await drizzleClient.query(`DELETE FROM inventory_categories`);
        await drizzleClient.query(`DELETE FROM inventory_laboratories`);

        const laboratoriesQuery = `
            SELECT
                lab.*,
                technician.email AS technician_email,
                faculty.email AS faculty_email
            FROM laboratory lab
            LEFT JOIN "user" technician ON technician.id = lab."technicianInChargeId"
            LEFT JOIN "user" faculty ON faculty.id = lab."facultyInChargeId"
        `;
        const laboratoriesResult = await typeormClient.query(laboratoriesQuery);

        async function emailExistsIn(client, email, table) {
            if (!email) return false;
            const result = await client.query(
                `SELECT 1 FROM ${table} WHERE email = $1 LIMIT 1`,
                [email]
            );
            return result.rowCount > 0;
        }
        
        for (const lab of laboratoriesResult.rows) {
            const technicianEmail = (await emailExistsIn(drizzleClient, lab.technician_email, 'staff')) ? lab.technician_email : null;
            const facultyEmail = (await emailExistsIn(drizzleClient, lab.faculty_email, 'faculty')) ? lab.faculty_email : null;
        
            await insertIntoDrizzle('inventory_laboratories', {
                id: lab.id,
                name: lab.name,
                location: lab.location,
                code: lab.code,
                technician_in_charge_email: technicianEmail,
                faculty_in_charge_email: facultyEmail,
                created_at: lab.createdAt,
                updated_at: lab.updatedAt,
            });
        }
        

        const categoriesQuery = `SELECT * FROM category`;
        const categoriesResult = await typeormClient.query(categoriesQuery);

        for (const category of categoriesResult.rows) {
            await insertIntoDrizzle('inventory_categories', {
                id: category.id,
                name: category.name,
                code: category.code,
                type: category.type,
                created_at: category.createdAt,
                updated_at: category.updatedAt,
            });
        }

        const vendorsQuery = `SELECT * FROM vendor`;
        const vendorsResult = await typeormClient.query(vendorsQuery);

        for (const vendor of vendorsResult.rows) {
            await insertIntoDrizzle('inventory_vendors', {
                id: vendor.id,
                vendor_id: vendor.vendorId,
                name: vendor.name,
                address: vendor.address,
                poc_name: vendor.pocName,
                phone_number: vendor.phoneNumber,
                email: vendor.email,
                created_at: vendor.createdAt,
                updated_at: vendor.updatedAt,
            });
        }

        const inventoryItemsQuery = `SELECT * FROM inventory_item`;
        const inventoryItemsResult = await typeormClient.query(inventoryItemsQuery);

        for (const item of inventoryItemsResult.rows) {
            await insertIntoDrizzle('inventory_items', {
                id: item.id,
                serial_number: item.serialNumber,
                lab_id: item.labId,
                transfer_id: item.transferId,
                item_category_id: item.itemCategoryId,
                item_name: item.itemName,
                specifications: item.specifications,
                quantity: item.quantity,
                no_of_licenses: item.noOfLicenses,
                nature_of_license: item.natureOfLicense,
                year_of_lease: item.yearOfLease,
                po_amount: item.poAmount,
                po_number: item.poNumber,
                po_date: item.poDate,
                lab_incharge_at_purchase: item.labInchargeAtPurchase,
                lab_technician_at_purchase: item.labTechnicianAtPurchase,
                equipment_id: item.equipmentID,
                funding_source: item.fundingSource,
                date_of_installation: item.dateOfInstallation,
                vendor_id: item.vendorId,
                warranty_from: item.warrantyFrom,
                warranty_to: item.warrantyTo,
                amc_from: item.amcFrom,
                amc_to: item.amcTo,
                current_location: item.currentLocation,
                softcopy_of_po: item.softcopyOfPO,
                softcopy_of_invoice: item.softcopyOfInvoice,
                softcopy_of_nfa: item.softcopyOfNFA,
                softcopy_of_amc: item.softcopyOfAMC,
                status: item.status,
                equipment_photo: item.equipmentPhoto,
                remarks: item.remarks,
                created_at: item.createdAt,
                updated_at: item.updatedAt,
            });
        }

        const vendorCategoriesQuery = `SELECT * FROM vendor_categories_category`;
        const vendorCategoriesResult = await typeormClient.query(vendorCategoriesQuery);

        for (const item of vendorCategoriesResult.rows) {
            await insertIntoDrizzle('vendor_categories', {
                vendor_id: item.vendorId,
                category_id: item.categoryId,
            });
        }

        await drizzleClient.query('COMMIT');
        console.log("Migration completed successfully!");
    } catch (error) {
        await drizzleClient.query('ROLLBACK');
        console.error("Error during migration:", error);
    } finally {
        await typeormClient.end();
        await drizzleClient.end();
    }
}

migrate();