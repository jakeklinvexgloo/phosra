/* eslint-disable */
/* Auto-generated stub — replace with `npx convex dev` for real types */
import type {
  GenericMutationCtx,
  GenericQueryCtx,
  GenericActionCtx,
  FunctionReference,
  DataModelFromSchemaDefinition,
} from "convex/server";
import type schema from "../schema";

type DataModel = DataModelFromSchemaDefinition<typeof schema>;

type MutationCtx = GenericMutationCtx<DataModel>;
type QueryCtx = GenericQueryCtx<DataModel>;
type ActionCtx = GenericActionCtx<DataModel>;

export declare const query: any;
export declare const mutation: any;
export declare const internalQuery: any;
export declare const internalMutation: any;
export declare const internalAction: any;
export declare const action: any;
export declare const httpAction: any;
