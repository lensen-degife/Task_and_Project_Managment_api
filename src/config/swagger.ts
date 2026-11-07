import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Project Management API",
            version: "1.0.0",
            description: "REST API for managing projects, tasks, members, and comments"
        },
        servers: [
            {
                url: "http://localhost:4000",
                description: "Development server"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },
    apis: ["./src/modules/**/*.routes.ts"]
};

export const swaggerSpec = swaggerJsdoc(options);