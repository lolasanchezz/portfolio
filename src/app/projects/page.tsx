import getJson5 from "../getJson"
import AllProjects from "./AllProjects"
export default async function Projects() {
    const projData = await getJson5("projects.json5")
    return (
        <AllProjects projects={projData} />
    )
}