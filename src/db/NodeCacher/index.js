import NodeCache from "node-cache";
import { maxRequests, timeWindow } from "../../constants.js";

const cache = new NodeCache({ stdTTL: timeWindow, useClones: false });

export { cache };
