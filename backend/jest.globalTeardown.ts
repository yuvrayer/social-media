import { execSync } from "child_process";

export default async () => {
    execSync(
        "docker compose down",
        { stdio: "inherit" }
    );
};