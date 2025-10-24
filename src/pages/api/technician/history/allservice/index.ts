import type { NextApiResponse } from "next";
import { sql } from "lib/db";
import { withAdminAuth, AdminRequest } from "../../../../../../lib/server/withAdminAuth";

type Service = {
  servicename: string;
};

async function handler(req: AdminRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const result = await sql`SELECT servicename FROM services`;

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "No services found" });
    }

    const services: Service[] = result.map(row => ({
      servicename: row.servicename as string,
    }));

    return res.status(200).json({ services });
  } catch (error) {
    console.error("Error fetching services:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export default withAdminAuth(handler);