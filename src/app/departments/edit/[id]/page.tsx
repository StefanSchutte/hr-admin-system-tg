import { Suspense } from "react";
import Loader from "~/components/ui/Loader";
import DepartmentEditForm from "./edit-form";

type PageProps = {
    params: {
        id: string;
    };
    searchParams?: Record<string, string | string[] | undefined>;
};

export default function DepartmentEditPage(props: PageProps) {
    return (
        <Suspense fallback={<Loader />}>
            <DepartmentEditForm departmentId={props.params.id} />
        </Suspense>
    );
}