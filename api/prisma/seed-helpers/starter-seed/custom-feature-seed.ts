import { PrismaClient, CustomListingScope } from '@prisma/client';

const customListingFeatures = [
  {
    displayName: 'Main Entrance is Barrier-Free',
    key: 'barrier_free_entrance',
    category: 'ENTRY & EXTERIOR',
    scope: CustomListingScope.PROPERTY,
  },
  {
    displayName: 'Accessible Tenant Parking Available',
    key: 'accessible_parking',
    category: 'ENTRY & EXTERIOR',
    scope: CustomListingScope.PROPERTY,
  },
  {
    displayName: 'On-Site Parking',
    key: 'parking_on_site',
    category: 'ENTRY & EXTERIOR',
    scope: CustomListingScope.PROPERTY,
  },
  {
    displayName: 'Good Pedestrian Access',
    key: 'pedestrian_access',
    category: 'ENTRY & EXTERIOR',
    scope: CustomListingScope.PROPERTY,
  },
  {
    displayName: 'Elevator in Building',
    key: 'elevator',
    category: 'PROPERTY AMENITIES',
    scope: CustomListingScope.PROPERTY,
  },
  {
    displayName: 'Elevator Size/Capacity',
    key: 'elevator_dimensions',
    category: 'PROPERTY AMENITIES',
    scope: CustomListingScope.PROPERTY,
  },
  {
    displayName: 'Braille Signage',
    key: 'braille_signage',
    category: 'PROPERTY AMENITIES',
    scope: CustomListingScope.PROPERTY,
  },
  {
    displayName: 'Tactile Cues (Textures/Domes)',
    key: 'tactile_cues',
    category: 'PROPERTY AMENITIES',
    scope: CustomListingScope.PROPERTY,
  },
  {
    displayName: 'Lowered Mailboxes',
    key: 'lowered_mailboxes',
    category: 'PROPERTY AMENITIES',
    scope: CustomListingScope.PROPERTY,
  },
  {
    displayName: 'Accessible Guest Intercom',
    key: 'accessible_visitor_entry',
    category: 'PROPERTY AMENITIES',
    scope: CustomListingScope.PROPERTY,
  },
  {
    displayName: 'Automated PROPERTY Doors',
    key: 'automated_door_PROPERTY',
    category: 'PROPERTY AMENITIES',
    scope: CustomListingScope.PROPERTY,
  },
  {
    displayName: 'Unit Entrance is Barrier-Free',
    key: 'barrier_free_unit_entrance',
    category: 'UNIT INTERIOR',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Automated Unit Doors',
    key: 'automated_door_unit',
    category: 'UNIT INTERIOR',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'No Stairs Within Unit',
    key: 'no_stairs_within_unit',
    category: 'UNIT INTERIOR',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Wide Doorways',
    key: 'wide_doorways',
    category: 'UNIT INTERIOR',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Lever Door Handles',
    key: 'lever_handles_on_doors',
    category: 'UNIT INTERIOR',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Lowered Light Switches',
    key: 'lowered_light_switch',
    category: 'UNIT INTERIOR',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Hard Flooring',
    key: 'hard_flooring_in_unit',
    category: 'UNIT INTERIOR',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Carpeted Floors',
    key: 'carpet_in_unit',
    category: 'UNIT INTERIOR',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Air Conditioning',
    key: 'ac_in_unit',
    category: 'UNIT INTERIOR',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Lowered Kitchen Counters',
    key: 'kitchen_counter_lowered',
    category: 'KITCHEN & BATH',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Lowered Cabinets',
    key: 'lowered_cabinets',
    category: 'KITCHEN & BATH',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Front Stove Controls',
    key: 'front_controls_stove_cook_top',
    category: 'KITCHEN & BATH',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Front Dishwasher Controls',
    key: 'front_controls_dishwasher',
    category: 'KITCHEN & BATH',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Bottom-Door Freezer',
    key: 'refrigerator_with_bottom_door_freezer',
    category: 'KITCHEN & BATH',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Non-Digital Appliances',
    key: 'non_digital_kitchen_appliances',
    category: 'KITCHEN & BATH',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Barrier-Free Bathroom',
    key: 'barrier_free_bathroom',
    category: 'KITCHEN & BATH',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Turning Circle in Bathroom',
    key: 'turning_circle_in_bathrooms',
    category: 'KITCHEN & BATH',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Lowered Bathroom Counters',
    key: 'bathroom_counter_lowered',
    category: 'KITCHEN & BATH',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Accessible Height Toilet',
    key: 'accessible_height_toilet',
    category: 'KITCHEN & BATH',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Roll-In Shower',
    key: 'roll_in_shower',
    category: 'KITCHEN & BATH',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Walk-In Shower',
    key: 'walk_in_shower',
    category: 'KITCHEN & BATH',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Grab Bars (General)',
    key: 'grab_bars',
    category: 'KITCHEN & BATH',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Smoke Detector w/ Strobe',
    key: 'smoke_detector_with_strobe',
    category: 'SAFETY & SENSORY',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'CO Detector w/ Strobe',
    key: 'carbon_monoxide_detector_with_strobe',
    category: 'SAFETY & SENSORY',
    scope: CustomListingScope.UNIT,
  },
  {
    displayName: 'Sprinkler System',
    key: 'fire_suppression_sprinkler_system',
    category: 'SAFETY & SENSORY',
    scope: CustomListingScope.PROPERTY,
  },
  {
    displayName: 'Service Animals Allowed',
    key: 'service_animals_allowed',
    category: 'SAFETY & SENSORY',
    scope: CustomListingScope.PROPERTY,
  },
];

export async function seedCustomListingFeatures(prisma: PrismaClient) {
  console.log('Seeding Custom Listing Features...');

  for (const feature of customListingFeatures) {
    await prisma.customListingFeatures.upsert({
      where: { key: feature.key },
      update: {
        displayName: feature.displayName,
        category: feature.category,
        scope: feature.scope,
      },
      create: feature,
    });
    console.log(`  Upserted feature: ${feature.key}`);
  }

  console.log('Finished seeding Custom Listing Features.');
}
