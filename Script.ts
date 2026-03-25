import { generate_bloc_files } from "src/Be5System/generate_bloc_files";


await generate_bloc_files(
    "src/core/ClientComponent/Navbar/Navbar.ts",
    "src/core/ClientComponent/Navbar/NavbarEditor.ts",
    "HorizontalNav"
)