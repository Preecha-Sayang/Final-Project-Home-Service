import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
    return {
        redirect: {
            destination: "/technician/pending?mode=inprogress",
            permanent: false,
        },
    };
};

export default function InprogressRedirect() {
    return null;
}
