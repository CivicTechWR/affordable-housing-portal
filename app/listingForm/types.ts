import { z } from "zod";
import type { Control, UseFormReturn } from "react-hook-form";

export const listingFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  propertyType: z.string().min(1, "Property type is required"),
  buildingType: z.string().min(1, "Building type is required"),
  unitStory: z.number().optional(),
  bedrooms: z.number({ message: "Bedrooms are required" }).min(0, "Invalid number of bedrooms"),
  bathrooms: z.number({ message: "Bathrooms are required" }).min(0, "Invalid number of bathrooms"),
  squareFeet: z.number().optional(),
  monthlyRentCents: z.number({ message: "Rent is required" }).min(0, "Rent cannot be negative"),
  leaseTerm: z.string().min(1, "Lease term is required"),
  utilitiesIncluded: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  availableOn: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  unitNumber: z.string().optional(),

  // Property Info
  name: z.string().min(1, "Property name is required"),
  street1: z.string().min(1, "Street address is required"),
  street2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Invalid email").min(1, "Contact email is required"),
  contactPhone: z.string().min(1, "Contact phone is required"),

  // Accessibility feature IDs that are checked
  accessibilityFeatures: z.array(z.string()).default([]),
});

export type ListingFormInput = z.input<typeof listingFormSchema>;
export type ListingFormData = z.output<typeof listingFormSchema>;
export type ListingFormContext = Record<string, never>;
export type ListingFormControl = Control<ListingFormInput, ListingFormContext, ListingFormData>;
export type ListingFormMethods = UseFormReturn<
  ListingFormInput,
  ListingFormContext,
  ListingFormData
>;

/**
 * TEMPORARY MOCK — This hardcoded data will be replaced by the
 * `customListingFields` API endpoint once the backend is wired up.
 * The canonical source of truth for accessibility feature definitions
 * lives in `db/seeds/custom-listing-fields.ts` and the database.
 *
 * Known discrepancies with the seed data:
 *   - id uses display labels instead of stable keys
 *   - "Proximity to Bus/Transit" vs seed's "Close to Bus/Transit"
 *   - descriptions differ from seed data
 *
 * See: useAccessibilityFeaturesQuery.ts
 */
export const ACCESSIBILITY_FEATURE_GROUPS = [
  {
    groupId: "entry_exterior",
    groupLabel: "Entry & Exterior",
    options: [
      {
        id: "Main Entrance is Barrier-Free",
        label: "Main Entrance is Barrier-Free",
        type: "boolean" as const,
        description: "The building's main entrance is level and accessible without stairs.",
      },
      {
        id: "Accessible Tenant Parking Available",
        label: "Accessible Tenant Parking Available",
        type: "boolean" as const,
        description: "Dedicated parking spots for tenants with disabilities.",
      },
      {
        id: "On-Site Parking",
        label: "On-Site Parking",
        type: "boolean" as const,
        description: "General parking is available on the property.",
      },
      {
        id: "Accessible Guest Parking",
        label: "Accessible Guest Parking",
        type: "boolean" as const,
        description: "Dedicated parking spots for visitors with disabilities.",
      },
      {
        id: "Proximity to Bus/Transit",
        label: "Proximity to Bus/Transit",
        type: "boolean" as const,
        description: "Public transit stops are located within close walking distance.",
      },
      {
        id: "Good Pedestrian Access",
        label: "Good Pedestrian Access",
        type: "boolean" as const,
        description: "Sidewalks and pathways around the building are clear and level.",
      },
    ],
  },
  {
    groupId: "building_amenities",
    groupLabel: "Building Amenities",
    options: [
      {
        id: "Elevator in Building",
        label: "Elevator in Building",
        type: "boolean" as const,
        description: "The building has at least one functioning passenger elevator.",
      },
      {
        id: "Cellphone Elevator Control",
        label: "Cellphone Elevator Control",
        type: "boolean" as const,
        description: "Elevators can be called and operated via a mobile app.",
      },
      {
        id: "Accessible Shared Laundry",
        label: "Accessible Shared Laundry",
        type: "boolean" as const,
        description: "Communal laundry facilities are designed for accessibility.",
      },
      {
        id: "Braille Signage",
        label: "Braille Signage",
        type: "boolean" as const,
        description: "Common areas and doors are equipped with Braille signs.",
      },
      {
        id: "Tactile Cues (Textures/Domes)",
        label: "Tactile Cues (Textures/Domes)",
        type: "boolean" as const,
        description: "Tactile warnings are present near stairs and transit loading zones.",
      },
      {
        id: "Lowered Mailboxes",
        label: "Lowered Mailboxes",
        type: "boolean" as const,
        description: "Mailboxes are positioned at an accessible height.",
      },
      {
        id: "Accessible Guest Intercom",
        label: "Accessible Guest Intercom",
        type: "boolean" as const,
        description: "Entrance intercoms are accessible and within reach.",
      },
      {
        id: "Automated Building Doors",
        label: "Automated Building Doors",
        type: "boolean" as const,
        description: "Main building doors open automatically with a button or motion sensor.",
      },
    ],
  },
  {
    groupId: "unit_interior",
    groupLabel: "Unit Interior",
    options: [
      {
        id: "Unit Entrance is Barrier-Free",
        label: "Unit Entrance is Barrier-Free",
        type: "boolean" as const,
        description: "The doorway to the unit has no steps or raised thresholds.",
      },
      {
        id: "Ceiling Lift Ready",
        label: "Ceiling Lift Ready",
        type: "boolean" as const,
        description: "The unit has reinforced ceilings to support lifting equipment.",
      },
      {
        id: "Automated Unit Doors",
        label: "Automated Unit Doors",
        type: "boolean" as const,
        description: "The entrance to the unit can open automatically.",
      },
      {
        id: "No Stairs Within Unit",
        label: "No Stairs Within Unit",
        type: "boolean" as const,
        description: "The entire living space is located on a single, flat level.",
      },
      {
        id: "Wide Doorways",
        label: "Wide Doorways",
        type: "boolean" as const,
        description: "Internal doors are wide enough for most standard wheelchairs.",
      },
      {
        id: "Lever Door Handles",
        label: "Lever Door Handles",
        type: "boolean" as const,
        description: "Doors are equipped with lever handles instead of round knobs.",
      },
      {
        id: "Lowered Light Switches",
        label: "Lowered Light Switches",
        type: "boolean" as const,
        description: "Light switches are placed lower on the wall for easier reach.",
      },
      {
        id: "Hard Flooring",
        label: "Hard Flooring",
        type: "boolean" as const,
        description: "Floors use hard materials like wood or vinyl instead of carpet.",
      },
      {
        id: "Carpeted Floors",
        label: "Carpeted Floors",
        type: "boolean" as const,
        description: "Floors in living areas and bedrooms are carpeted.",
      },
      {
        id: "Air Conditioning",
        label: "Air Conditioning",
        type: "boolean" as const,
        description: "The unit is equipped with cooling/air conditioning.",
      },
    ],
  },
  {
    groupId: "kitchen_bath",
    groupLabel: "Kitchen & Bath",
    options: [
      {
        id: "Lowered Kitchen Counters",
        label: "Lowered Kitchen Counters",
        type: "boolean" as const,
        description: "Kitchen work surfaces are installed at a reduced height.",
      },
      {
        id: "Lowered Cabinets",
        label: "Lowered Cabinets",
        type: "boolean" as const,
        description: "Storage cabinets and cupboards are easily reachable.",
      },
      {
        id: "Front Stove Controls",
        label: "Front Stove Controls",
        type: "boolean" as const,
        description: "Control knobs for the stove are located at the front, not the back.",
      },
      {
        id: "Convection Cooktop",
        label: "Convection Cooktop",
        type: "boolean" as const,
        description: "The unit includes a flat, safe convection or induction cooking surface.",
      },
      {
        id: "Front Dishwasher Controls",
        label: "Front Dishwasher Controls",
        type: "boolean" as const,
        description: "Dishwasher buttons are front-facing and accessible.",
      },
      {
        id: "Bottom-Door Freezer",
        label: "Bottom-Door Freezer",
        type: "boolean" as const,
        description: "The refrigerator features a pull-out freezer compartment at the bottom.",
      },
      {
        id: "Non-Digital Appliances",
        label: "Non-Digital Appliances",
        type: "boolean" as const,
        description: "Appliances use analog controls which may be easier for some to operate.",
      },
      {
        id: "Barrier-Free Bathroom",
        label: "Barrier-Free Bathroom",
        type: "boolean" as const,
        description: "The bathroom is spacious and fully wheelchair accessible.",
      },
      {
        id: "Lowered Bathroom Counters",
        label: "Lowered Bathroom Counters",
        type: "boolean" as const,
        description: "The sink and vanity are installed at a convenient lower height.",
      },
      {
        id: "Accessible Height Toilet",
        label: "Accessible Height Toilet",
        type: "boolean" as const,
        description: "The toilet seat is raised for easier transfer and use.",
      },
      {
        id: "Roll-In Shower",
        label: "Roll-In Shower",
        type: "boolean" as const,
        description: "The shower has no threshold allowing a wheelchair to roll directly in.",
      },
      {
        id: "Walk-In Shower",
        label: "Walk-In Shower",
        type: "boolean" as const,
        description: "The shower has a low threshold step, easier than a traditional bathtub.",
      },
      {
        id: "Grab Bars (General)",
        label: "Grab Bars (General)",
        type: "boolean" as const,
        description: "Sturdy grab bars are installed near the toilet and shower areas.",
      },
    ],
  },
  {
    groupId: "safety_sensory",
    groupLabel: "Safety & Sensory",
    options: [
      {
        id: "Smoke & CO Detectors w/ Strobe",
        label: "Smoke & CO Detectors w/ Strobe",
        type: "boolean" as const,
        description:
          "Alarms include bright flashing lights to alert individuals with hearing impairments.",
      },
      {
        id: "Sprinkler System",
        label: "Sprinkler System",
        type: "boolean" as const,
        description: "The building/unit has an integrated fire sprinkler system.",
      },
      {
        id: "Service Animals Allowed",
        label: "Service Animals Allowed",
        type: "boolean" as const,
        description: "Certified service animals are explicitly permitted.",
      },
    ],
  },
];

export const INITIAL_FORM_DATA: ListingFormData = {
  title: "",
  description: "",
  propertyType: "",
  buildingType: "",
  unitStory: undefined, // Add this
  bedrooms: 0,
  bathrooms: 0,
  squareFeet: undefined, // Add this
  monthlyRentCents: 0,
  leaseTerm: "",
  utilitiesIncluded: [],
  images: [],
  availableOn: undefined, // Add this
  status: "draft",
  unitNumber: undefined,
  name: "",
  street1: "",
  street2: "",
  city: "",
  province: "",
  postalCode: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  accessibilityFeatures: [],
};
