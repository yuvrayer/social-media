import { execSync } from "child_process";

export default async () => {
    execSync(
        "docker compose up -d --wait database",
        { stdio: "inherit" }
    );

    execSync(
        `docker exec sn-compose-database mysql -h 127.0.0.1 -uroot -e "CREATE DATABASE IF NOT EXISTS twitter_test;"`,
        { stdio: "inherit" }
    );

    console.log("Test database is ready");
};