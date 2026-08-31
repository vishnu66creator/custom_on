import { getReferenceDesigns, saveReferenceDesign } from "./db/app-service";

export type ReferenceDesign = {
  id: string;
  name: string;
  svg: string;
};

export function getCustomDesigns(): Promise<ReferenceDesign[]> {
  return getReferenceDesigns();
}

export function saveCustomDesign(name: string, svg: string): Promise<ReferenceDesign> {
  return saveReferenceDesign({ data: { name, svg } });
}

export function getDesigns(): Promise<ReferenceDesign[]> {
  return getCustomDesigns();
}
