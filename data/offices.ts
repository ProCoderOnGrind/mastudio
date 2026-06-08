export interface Office {
  city: string;
  label: string;
  address: string[];
  email: string;
}
export const OFFICES: Office[] = [
  { city: "Copenhagen", label: "BIG Copenhagen", address: ["Bryghuspladsen 8", "1473 Copenhagen", "Denmark"], email: "cph@example.com" },
  { city: "Barcelona", label: "BIG Barcelona", address: ["Carrer d'Àvila 138", "08018 Barcelona", "Spain"], email: "bcn@example.com" },
  { city: "London", label: "BIG London", address: ["1 Finsbury Avenue", "London EC2M 2PF", "United Kingdom"], email: "lon@example.com" },
  { city: "New York", label: "BIG New York", address: ["45 Main Street", "Brooklyn, NY 11201", "USA"], email: "nyc@example.com" },
  { city: "Shanghai", label: "BIG Shanghai", address: ["No. 1 Suzhou Creek", "Shanghai", "China"], email: "sha@example.com" },
  { city: "Los Angeles", label: "BIG Los Angeles", address: ["500 S Santa Fe Ave", "Los Angeles, CA", "USA"], email: "la@example.com" },
  { city: "Zürich", label: "BIG Zürich", address: ["Bahnhofstrasse 1", "8001 Zürich", "Switzerland"], email: "zur@example.com" },
  { city: "Bhutan", label: "BIG Bhutan", address: ["Gelephu", "Bhutan"], email: "bhutan@example.com" },
];
