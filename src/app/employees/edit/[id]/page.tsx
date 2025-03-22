import EmployeeClientPage from "./client-page";
import type { PageProps } from "~/types/types";

/**
 * Server Component for the employee edit page.
 * Handles the dynamic route parameters and passes the employee ID to the client component.
 * @param props - The page component props containing route parameters
 * @returns The client component responsible for fetching and rendering the employee edit form
 */
export default async function Page(props: PageProps) {
    const params = await props.params;
    const id: string = params.id;

    return <EmployeeClientPage employeeId={id} />;
}