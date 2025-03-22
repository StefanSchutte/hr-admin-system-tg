// src/app/employees/edit/[id]/page.tsx
import { Suspense } from "react";
import Loader from "~/components/ui/Loader";
import EmployeeEditForm from "./edit-form";

type PageProps = {
    params: {
        id: string;
    };
    searchParams?: Record<string, string | string[] | undefined>;
};

export default function EmployeeEditPage(props: PageProps) {
    return (
        <Suspense fallback={<Loader />}>
            <EmployeeEditForm employeeId={props.params.id} />
        </Suspense>
    );
}