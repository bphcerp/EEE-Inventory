import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

const About = () => {
    const people = [
        {
            name: "Prof. Harish V. Dixit",
            fallback: "HVD",
            role: "Head & Assistant Professor, EEE Department",
            description: "Founder, LAMBDA Lab, BITS Hyderabad",
            image: "/prof_hvd.jpg",
        },
        {
            name: "Prof. Supradeepan K",
            fallback: "SK",
            role: "Associate Professor, Department of Mechanical Engineering",
            description: "Website Incharge, BITS Hyderabad",
            image: "/prof_supradeepan.jpg",
        },
        {
            name: "P. V. Pranava Sreeyush",
            fallback: "PS",
            role: "Website Developer",
            description: "2026 Graduate, BITS Hyderabad",
            image: "/developer_pranav.jpg",
        },
    ];

    return (
        <div className="container mx-auto flex flex-col space-y-6 py-4 px-4">
            <h1 className="text-4xl font-bold text-center mb-8">The Team</h1>
            <div className="grid grid-cols-1 md:grid-cols-3">
                {people.map((person, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        className="flex justify-center items-center"
                    >
                        <Card className="text-center w-80 h-64 shadow-xl dark:shadow-zinc-900 rounded-2xl bg-zinc-100 dark:bg-zinc-900">
                            <CardHeader>
                                <div className="flex flex-col justify-center items-center">
                                    <Avatar className="size-16">
                                        <AvatarImage src={person.image} alt="@shadcn" />
                                        <AvatarFallback className="text-lg">{person.fallback}</AvatarFallback>
                                    </Avatar>
                                    <CardTitle className="mt-4 text-lg">{person.name}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="text-sm">
                                <p className="text-gray-500 dark:text-gray-400 font-semibold">{person.role}</p>
                                <p className="mt-2 text-gray-700 dark:text-gray-500">{person.description}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-8 text-center text-gray-400"
            >
                Prof. Harish V. Dixit, recognized the need to streamline departmental processes by moving away from manual, time-consuming tasks to a more efficient, web-based system. With guidance from Prof. Supradeepan, who has worked on various web development projects for the institute, this initiative was conceived to improve accessibility and automation.
            </motion.p>
        </div>
    );
};

export default About;