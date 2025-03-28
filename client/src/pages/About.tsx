import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Link } from "react-router";

const About = () => {
    const people = [
        {
            name: "P. V. Pranava Sreeyush",
            fallback: "PS",
            role: "Website Developer, B.E. Electronics and Communication Engineering",
            email: "poluripranav@gmail.com",
            image: "/developer_pranav.jpg",
        },
        {
            name: "Prof. Supradeepan K",
            fallback: "SK",
            role: "Associate Professor, Department of Mechanical Engineering",
            email: "supradeepan@hyderabad.bits-pilani.ac.in",
            image: "/prof_supradeepan.jpg",
        },
    ];

    return (
        <div className="container mx-auto flex flex-col space-y-12 text-xl">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl font-bold text-center mt-10">
                    The Team
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center"
            >
                Made by <strong>Department of Electronics and Electrical Engineering</strong> in collaboration with <strong>Department of Mechanical Engineering</strong>
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-2">
                {people.map((person, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex justify-center items-center"
                    >
                        <Card className="text-center w-96 h-64 shadow-xl dark:shadow-zinc-900 rounded-2xl bg-zinc-100 dark:bg-zinc-900">
                            <CardHeader>
                                <div className="flex flex-col justify-center items-center">
                                    <Avatar className="size-16">
                                        <AvatarImage src={person.image} alt="@shadcn" />
                                        <AvatarFallback className="text-lg">{person.fallback}</AvatarFallback>
                                    </Avatar>
                                    <CardTitle className="mt-4 text-lg">{person.name}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="text-sm flex flex-col space-y-1">
                                <p className="text-gray-500 dark:text-gray-400 font-semibold">{person.role}</p>
                                <Link target="_blank" rel="noopener noreferrer" to={`mailto:${person.email}`} className="mt-2 hover:underline text-gray-700 dark:text-gray-500">Email: {person.email}</Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default About;