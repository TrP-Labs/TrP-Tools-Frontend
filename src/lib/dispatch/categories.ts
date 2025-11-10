import { DispatchVehicle } from "@/lib/api/dispatch";

export type VehicleCategory = "service" | "staff" | "trolleybus" | "other";

export const VEHICLE_CATEGORY_LABELS: Record<VehicleCategory, string> = {
  service: "Service Vehicles",
  staff: "Staff Vehicles",
  trolleybus: "Trolleybuses",
  other: "Other Vehicles",
};

const CATEGORY_ORDER: VehicleCategory[] = ["service", "staff", "trolleybus", "other"];

const KEYWORD_RULES: Array<{ category: VehicleCategory; keywords: RegExp[] }> = [
  {
    category: "service",
    keywords: [/service/i, /maintenance/i, /support/i, /rescue/i, /utility/i],
  },
  {
    category: "staff",
    keywords: [/staff/i, /escort/i, /vaz/i, /sedan/i, /sputnik/i],
  },
  {
    category: "trolleybus",
    keywords: [/trolley/i, /bus/i, /ziu/i, /zi\u00da/i],
  },
];

const NAMED_OVERRIDES: Array<{ match: RegExp; category: VehicleCategory }> = [
  { match: /^ziu-682/i, category: "service" },
  { match: /sputnik/i, category: "staff" },
];

export function categorizeVehicleByName(name: string | null | undefined): VehicleCategory {
  if (!name) return "other";
  for (const override of NAMED_OVERRIDES) {
    if (override.match.test(name)) {
      return override.category;
    }
  }
  for (const { category, keywords } of KEYWORD_RULES) {
    if (keywords.some((rule) => rule.test(name))) {
      return category;
    }
  }
  return "other";
}

export function groupVehiclesByCategory(vehicles: DispatchVehicle[]): Record<VehicleCategory, DispatchVehicle[]> {
  const grouped: Record<VehicleCategory, DispatchVehicle[]> = {
    service: [],
    staff: [],
    trolleybus: [],
    other: [],
  };

  vehicles.forEach((vehicle) => {
    const category = categorizeVehicleByName(vehicle.name);
    grouped[category].push(vehicle);
  });

  CATEGORY_ORDER.forEach((category) => {
    grouped[category].sort((a, b) => {
      const byDepot = a.depot.localeCompare(b.depot, undefined, { sensitivity: "base" });
      if (byDepot !== 0) return byDepot;
      return a.id.localeCompare(b.id, undefined, { sensitivity: "base" });
    });
  });

  return grouped;
}

export function orderedCategories(): VehicleCategory[] {
  return [...CATEGORY_ORDER];
}
