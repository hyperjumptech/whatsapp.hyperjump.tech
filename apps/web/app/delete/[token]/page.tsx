import { withDbContext } from "@/lib/context/db";
import { DeletePage } from "./delete-page";

/**
 * The DeletePage component is wrapped with the withDbContext HOC to provide
 * the Prisma client to the component.
 */
export default withDbContext(DeletePage);
