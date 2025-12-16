"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  Calendar,
  FileText,
  ClipboardList,
  Save,
  Printer,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import useMedicines from "@/hooks/useMedicines";
import { useMedicineStore } from "@/store";
import { Medicine } from "@/types/medicines";

const EMPTY_MEDICINES: Medicine[] = [];

const Dispense = () => {
  const { medicinesQuery } = useMedicines();
  const medicines = medicinesQuery.data ?? EMPTY_MEDICINES;
  const medicinesError = medicinesQuery.error as Error | null;

  const [patient, setPatient] = useState({
    id: "",
    name: "",
    age: "",
    gender: "",
    note: "",
    doctor: "",
  });
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const {
    selectedItems,
    addItem,
    updateQuantity,
    updateInstruction,
    removeItem,
    resetItems,
  } = useMedicineStore();

  const filteredMedicines = useMemo(() => {
    return medicines.filter(
      (medicine) =>
        medicine.name.toLowerCase().includes(search.toLowerCase()) ||
        medicine.genericName.toLowerCase().includes(search.toLowerCase())
    );
  }, [medicines, search]);

  const totals = useMemo(() => {
    const totalItems = selectedItems.length;
    const totalQuantity = selectedItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const estimated = selectedItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    return { totalItems, totalQuantity, estimated };
  }, [selectedItems]);

  const handleAddMedicine = (medicine: Medicine) => {
    addItem({
      id: medicine.id,
      name: medicine.name,
      genericName: medicine.genericName,
      unit: medicine.unit,
      price: medicine.price,
    });
    setSearch("");
    setShowResults(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Dispensing
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 mt-1">
            Dispense Medicines
          </h1>
          <p className="text-slate-500 mt-1">
            Capture patient detail, add medicines, and finalize the receipt in
            one flow.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print Preview
          </Button>
          <Button className="bg-slate-900 hover:bg-slate-800">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Complete Dispense
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-sm text-slate-500">Selected Medicines</p>
          <p className="text-3xl font-semibold text-slate-900 mt-2">
            {totals.totalItems}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-sm text-slate-500">Total Quantity</p>
          <p className="text-3xl font-semibold text-slate-900 mt-2">
            {totals.totalQuantity}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-sm text-slate-500">Estimated Cost</p>
          <p className="text-3xl font-semibold text-slate-900 mt-2">
            ฿{totals.estimated.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-slate-500" />
              <p className="text-sm font-semibold text-slate-800">
                Patient Profile
              </p>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-500">
                Patient ID
              </label>
              <Input
                placeholder="Optional"
                value={patient.id}
                onChange={(event) =>
                  setPatient((prev) => ({ ...prev, id: event.target.value }))
                }
              />
              <label className="text-xs font-medium text-slate-500">
                Full Name
              </label>
              <Input
                placeholder="Patient name"
                value={patient.name}
                onChange={(event) =>
                  setPatient((prev) => ({ ...prev, name: event.target.value }))
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    Age
                  </label>
                  <Input
                    type="number"
                    placeholder="Years"
                    value={patient.age}
                    onChange={(event) =>
                      setPatient((prev) => ({ ...prev, age: event.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    Gender
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                    value={patient.gender}
                    onChange={(event) =>
                      setPatient((prev) => ({
                        ...prev,
                        gender: event.target.value,
                      }))
                    }
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-500" />
              <p className="text-sm font-semibold text-slate-800">
                Prescription Detail
              </p>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-500">
                Physician
              </label>
              <Input
                placeholder="Doctor in charge"
                value={patient.doctor}
                onChange={(event) =>
                  setPatient((prev) => ({ ...prev, doctor: event.target.value }))
                }
              />
              <label className="text-xs font-medium text-slate-500">
                Visit Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="date"
                  className="pl-9"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <label className="text-xs font-medium text-slate-500">
                Notes
              </label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                placeholder="e.g. fasting, allergies, ward info"
                value={patient.note}
                onChange={(event) =>
                  setPatient((prev) => ({ ...prev, note: event.target.value }))
                }
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Add Medicines
                  </p>
                  <p className="text-xs text-slate-500">
                    Search inventory by name or generic name
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {medicinesQuery.isFetching
                    ? "Syncing..."
                    : `${medicines.length} available`}
                </Badge>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Paracetamol, Ibuprofen, Amoxicillin..."
                  className="pl-10"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setShowResults(Boolean(event.target.value));
                  }}
                />

                {showResults && search && (
                  <div className="absolute left-0 right-0 top-14 z-20 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                    {filteredMedicines.length ? (
                      filteredMedicines.map((medicine) => (
                        <button
                          type="button"
                          key={medicine.id}
                          onClick={() => handleAddMedicine(medicine)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {medicine.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {medicine.genericName}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-slate-900">
                                ฿{medicine.price.toFixed(2)}
                              </p>
                              <p className="text-xs text-slate-500">
                                In stock: {medicine.totalStock} {medicine.unit}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-slate-500">
                        <AlertCircle className="w-5 h-5 mx-auto mb-2 text-slate-400" />
                        <p>No medicines match that search.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Prescription Items
                </p>
                <p className="text-xs text-slate-500">
                  {selectedItems.length
                    ? `${selectedItems.length} medicines selected`
                    : "Start adding medicines to build this prescription"}
                </p>
              </div>
              {selectedItems.length ? (
                <Badge variant="secondary" className="text-slate-700">
                  {totals.totalQuantity} units total
                </Badge>
              ) : null}
            </div>

            <div className="p-6 space-y-4">
              {!selectedItems.length && (
                <div className="text-center py-16 text-slate-500">
                  <ClipboardList className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">No medicines added yet</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Use the search above to add medicines from inventory.
                  </p>
                </div>
              )}

              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.genericName} • ฿{item.price.toFixed(2)} /{" "}
                        {item.unit}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-rose-600 hover:text-rose-700"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500">
                        Quantity
                      </label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(event) =>
                            updateQuantity(
                              item.id,
                              Number(event.target.value) || 1
                            )
                          }
                          className="w-16 text-center"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500">
                        Dosage
                      </label>
                      <Input
                        placeholder="1 tablet"
                        value={item.dosage}
                        onChange={(event) =>
                          updateInstruction(
                            item.id,
                            "dosage",
                            event.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500">
                        Frequency
                      </label>
                      <Input
                        placeholder="3x daily"
                        value={item.frequency}
                        onChange={(event) =>
                          updateInstruction(
                            item.id,
                            "frequency",
                            event.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500">
                        Duration
                      </label>
                      <Input
                        placeholder="7 days"
                        value={item.duration}
                        onChange={(event) =>
                          updateInstruction(
                            item.id,
                            "duration",
                            event.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-sm">
                    <p className="text-slate-500">
                      {item.quantity} × ฿{item.price.toFixed(2)}
                    </p>
                    <p className="font-semibold text-slate-900">
                      ฿{(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {selectedItems.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">
                      Estimate
                    </p>
                    <p className="text-2xl font-semibold text-slate-900">
                      ฿{totals.estimated.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={resetItems}>
                      Cancel
                    </Button>
                    <Button className="bg-slate-900 hover:bg-slate-800">
                      Continue to Receipt
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {medicinesError && (
        <div className="bg-rose-50 text-rose-700 border border-rose-100 rounded-lg px-4 py-3">
          {medicinesError.message ?? "Unable to load medicines"}
        </div>
      )}
    </div>
  );
};

export default Dispense;
