import { BunRunner } from "@bernouy/socle";
import { ControlCms } from "src/control/ControlCms";
import { InMemoryCmsRepository } from "src/socle/providers/memory/CmsRepositoryInMemory";
import { InMemoryAuthentication } from "./InMemoryAuthentication";
import { InMemoryMedia } from "./InMemoryMedia";


export default function humanTest(){


    const runner = new BunRunner();
    
    const auth = new InMemoryAuthentication({
        role: "admin"
    })

    const controlCms = new ControlCms(
        runner,
        new InMemoryCmsRepository(),
        auth,
        new InMemoryMedia()
    )

    runner.start();

}


humanTest();