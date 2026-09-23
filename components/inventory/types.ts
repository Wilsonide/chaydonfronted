export interface InventoryForm {
  name: string;
  category: string;
  unit: string;
  quantity: string;
  minimum_quantity: string;
  unit_selling_price: string;
  description: string;
}

export interface MovementForm {
  quantity: string;
  unit_selling_price: string;
  reason: string;
}

export interface AdjustmentForm {
  new_quantity: string;
  reason: string;
}

export const emptyInventoryForm: InventoryForm = {
  name: "",
  category: "",
  unit: "",
  quantity: "0",
  minimum_quantity: "0",
  unit_selling_price: "0",
  description: "",
};

export const emptyMovementForm: MovementForm = {
  quantity: "",
  unit_selling_price: "",
  reason: "",
};

export const emptyAdjustmentForm: AdjustmentForm = {
  new_quantity: "",
  reason: "",
};
