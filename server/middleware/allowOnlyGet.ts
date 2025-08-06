/**
 * @file allowOnlyGet.ts
 * @description This file contains the middleware function to allow only GET requests. As this code is integrated with EEE IMS, this repo will no longer be maintained
 *  and is provided for reference only. The get requests will be allowed only until it's verified that the EEE-IMS integration has the same data as before,
 */

import { Request, Response, NextFunction } from 'express';

const READ_ONLY_ALLOWED_MESSAGE = 'This portal is set to read-only. Please use the EEE IMS portal for any modifications.';

// Allow only get requests middleware
const allowOnlyGet = async (req: Request, res: Response, next: NextFunction) => {

    if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
        // Block websockwet requests, all modifying operations are blocked
        res.status(410).json({ message: READ_ONLY_ALLOWED_MESSAGE})
        return
    }

    try {
        if (req.method === 'GET') next() 
        else {
            res.status(410).json({ message: READ_ONLY_ALLOWED_MESSAGE})
            return
        }
        
    } catch (error) {
        res.status(440).json({ message: 'Something went wrong', error })
        console.error(error)
    }
};

export default allowOnlyGet;