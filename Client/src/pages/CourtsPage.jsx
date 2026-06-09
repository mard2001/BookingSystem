import React, { useState, useMemo, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { addCourt, deleteCourt, getCountAvailableCourts, getCountMaintenanceCourts, getCountTotalCourts, getCountUnavailableCourts, getCourts, updateCourt } from "../api/services/courtService";
import { CalendarX, CheckCircle2, EditIcon, PlusCircle, Ratio, Trash2Icon, Wrench } from "lucide-react";
import { getExportFilename } from "../utils/ExportTable";
import { StatsGrid } from "../components/StatsGrid";
import { Modal } from "../components/Modal";
import { toast } from "sonner";
import { validateForm } from "../utils/ValueValidate";
import { addCourtRules } from "../Rules/CourtInputRules";

export const CourtsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courtToDelete, setCourtToDelete] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newCourt, setNewCourt] = useState({
    courtLabel: "", courtSport: "", courtType: "", courtDesc: "", isActive: 1, rate1: "", rate2: "", rate3: "", rate4: "",
  });
  const [editForm, setEditForm] = useState({
    courtLabel: "", courtSport: "", courtType: "", courtDesc: "", isActive: 1, rate1: "", rate2: "", rate3: "", rate4: "",
  });

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoading(true);
        const courts = await getCourts();
        setData(courts);
      } catch (err) {
        toast.error("Failed to load courts.");
        setError("Failed to load courts.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourts();
  }, []);

  const handleEdit = (court) => {
    setSelectedCourt(court);
    setEditForm({ ...court });
    setFieldErrors({}); 
    setIsEditing(false); 
    setModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    const errors = validateForm(editForm, addCourtRules);
    if (Object.keys(errors).length > 0) {
        setFieldErrors(errors); 
        return;
    }
    
    try {
      await updateCourt(selectedCourt.courtID, editForm);
      setData(prev => prev.map(c =>
        c.courtID === selectedCourt.courtID
          ? { ...c, ...editForm, isActive: Number(editForm.isActive) }  // ← coerce here
          : c
      ));
      toast.success("Court updated successfully.");
      setIsEditing(false);
      setModalOpen(false);
    } catch (err) {
      toast.error("Failed to update court.");
      toast.error(err.message);
      if (err.errors?.missing) {
        const errors = Object.fromEntries(err.errors.missing.map(f => [f, "This field is required."]));
        setFieldErrors(errors);
      }
    }
  };


  const handleDelete = (court) => {
    setCourtToDelete(court);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const data = await deleteCourt(courtToDelete.courtID);
      setData(prev => prev.filter(c => c.courtID !== courtToDelete.courtID));
      setDeleteModalOpen(false);
      setCourtToDelete(null);
      toast.success(data.message);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleNewCourtChange = (e) => {
    const { name, value } = e.target;
    setNewCourt(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCourt = async () => {
    const errors = validateForm(newCourt, addCourtRules);
    if (Object.keys(errors).length > 0) {
        setFieldErrors(errors); 
        return;
    }

    try {
      const added = await addCourt(newCourt);
      setData(prev => [...prev, added]);
      setAddModalOpen(false);
      toast.success(added.message);
      setFieldErrors({});
      setNewCourt({ courtLabel: "", courtSport: "", courtType: "", courtDesc: "", isActive: 1, rate1: "", rate2: "", rate3: "", rate4: "" }); // reset
    } catch (err) {
      toast.error(err.message);
      if (err.errors?.missing) {
        const errors = Object.fromEntries(err.errors.missing.map(f => [f, "This field is required."]));
        setFieldErrors(errors);
      }
    }
  };

  const columns = useMemo(() => [
    { header: "Court ID",accessorKey: "courtID" },
    {
      header: "Court",
      id: "court",
      accessorFn: (row) => row.courtLabel,
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-gray-800">{row.original.courtLabel}</p>
          <p className="text-xs text-gray-400">{row.original.courtSport}</p>
        </div>
      ),
    },
    { 
      header: "Type", 
      accessorKey: "courtType",
      cell: ({ row }) => (
        <span className="inline-flex w-fit px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          {row.original.courtType}
        </span>
      ),
    },
    {
      header: "Description",
      accessorKey: "courtDesc",
      cell: ({ getValue }) => {
        const text = getValue() ?? "";
        const MAX = 40;
        return (
          <span title={text} className="cursor-default text-secondary">
            {text.length > MAX ? text.slice(0, MAX) + "..." : text}
          </span>
        );
      }
    },
    {
      header: "Weekday AM",
      accessorKey: "rate1",
      cell: ({ getValue }) => {
        const value = parseFloat(getValue()) || 0;
        return (
          <span>₱{value.toFixed(2)}</span>
        );
      }
    },
    {
      header: "Weekday PM",
      accessorKey: "rate2",
      cell: ({ getValue }) => {
        const value = parseFloat(getValue()) || 0;
        return (
          <span>₱{value.toFixed(2)}</span>
        );
      }
    },
    {
      header: "Weekend AM",
      accessorKey: "rate3",
      cell: ({ getValue }) => {
        const value = parseFloat(getValue()) || 0;
        return (
          <span>₱{value.toFixed(2)}</span>
        );
      }
    },
    {
      header: "Weekend PM",
      accessorKey: "rate4",
      cell: ({ getValue }) => {
        const value = parseFloat(getValue()) || 0;
        return (
          <span>₱{value.toFixed(2)}</span>
        );
      }
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: ({ getValue }) => {
        const status = getValue();

        const statusMap = {
          1: { label: "Available", style: "bg-green-100 text-green-700" },
          0: { label: "Under Maintenance", style: "bg-yellow-100 text-yellow-700" },
          2: { label: "Unavailable", style: "bg-red-100 text-red-700" },
        };

        const { label, style } = statusMap[status] ?? { label: "Unknown", style: "bg-gray-100 text-gray-600" };

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>
            {label}
          </span>
        );
      }
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 hover:cursor-pointer"
          >
            <EditIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDelete(row.original)}
            className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 hover:cursor-pointer"
          >
            <Trash2Icon className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ], [handleEdit, handleDelete]);

  const stats = useMemo(() => [
    { icon: Ratio, iconColor: "text-primary", label: "Total Courts", value: data.length },
    { icon: CheckCircle2, iconColor: "text-[#00FF00]", label: "Available Courts", value: data.filter(c => c.isActive === 1).length },
    { icon: CalendarX, iconColor: "text-[#FF0000]", label: "Unavailable Courts", value: data.filter(c => c.isActive === 2).length },
    { icon: Wrench, iconColor: "text-[#FFA500]", label: "Under Maintenance", value: data.filter(c => c.isActive === 0).length },
  ], [data]);

  return (
    <>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-primary">Courts</p>
            <p className="text-sm text-secondary">Manage all facilities, types, and dynamic pricing rules</p>
          </div>
          <button onClick={() => {setFieldErrors({}); setAddModalOpen(true)}}
            className="flex items-center justify-center w-full sm:w-auto px-6 sm:px-10 py-2 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 hover:cursor-pointer">
            <PlusCircle className="w-5 h-5 mr-2" /> Add New Court
          </button>
        </div>

        <StatsGrid items={stats} maxCols={4} />
        
        <DataTable
          data={data}
          columns={columns}
          loading={loading}
          error={error}
          placeholder="Search courts..."
          pageSize={5}
          exportable={true}
          exportFilename={getExportFilename("courts")}
        />
      </div>

      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} size="lg">
        <div>
          <h2 className="text-xl font-bold text-primary mb-1">Add New Court</h2>
          <p className="text-sm text-secondary mb-6">Fill in the details to register a new court.</p>

          <hr className='max-md mb-10 text-secondary/30'/>
          <div className="space-y-5">
            {/* Court Label & Sport */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Court Label</label>
                <input
                  type="text"
                  name="courtLabel"
                  value={newCourt.courtLabel}
                  onChange={handleNewCourtChange}
                  placeholder="e.g. Court A"
                  className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30
                    ${fieldErrors.courtLabel 
                        ? "border-red-500 focus:ring-red-300" 
                        : "border-gray-200 focus:ring-primary/30"
                    }`}
                />
                {fieldErrors.courtLabel && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.courtLabel} </span>)}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Sport</label>
                <input
                  type="text"
                  name="courtSport"
                  value={newCourt.courtSport}
                  onChange={handleNewCourtChange}
                  placeholder="e.g. Badminton"
                  className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30
                    ${fieldErrors.courtSport 
                        ? "border-red-500 focus:ring-red-300" 
                        : "border-gray-200 focus:ring-primary/30"
                    }`}
                />
                {fieldErrors.courtSport && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.courtSport} </span>)}
              </div>
            </div>

            {/* Type & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Court Type</label>
                <select 
                  name="courtType"
                  value={newCourt.courtType}
                  onChange={handleNewCourtChange}
                  className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30
                    ${fieldErrors.courtType 
                        ? "border-red-500 focus:ring-red-300" 
                        : "border-gray-200 focus:ring-primary/30"
                    }`}
                >
                  <option value="">Select type...</option>
                  <option value="Indoor">Indoor</option>
                  <option value="Outdoor">Outdoor</option>
                </select>
                {fieldErrors.courtType && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.courtType} </span>)}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
                <select 
                name="isActive"
                  value={newCourt.isActive}
                  onChange={handleNewCourtChange}
                  className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30
                    ${fieldErrors.isActive 
                        ? "border-red-500 focus:ring-red-300" 
                        : "border-gray-200 focus:ring-primary/30"
                    }`}
                  >
                  <option value={1}>Available</option>
                  <option value={0}>Under Maintenance</option>
                  <option value={2}>Unavailable</option>
                </select>
                {fieldErrors.isActive && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.isActive} </span>)}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description</label>
              <textarea
                name="courtDesc"
                value={newCourt.courtDesc}
                onChange={handleNewCourtChange}
                rows={3}
                placeholder="Brief description of the court..."
                className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none
                  ${fieldErrors.courtDesc 
                      ? "border-red-500 focus:ring-red-300" 
                      : "border-gray-200 focus:ring-primary/30"
                  }`}
              />
              {fieldErrors.courtDesc && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.courtDesc} </span>)}
            </div>

            {/* Rates */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Pricing Rates</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Weekday AM", key: "rate1" },
                  { label: "Weekday PM", key: "rate2" },
                  { label: "Weekend AM", key: "rate3" },
                  { label: "Weekend PM", key: "rate4" },
                ].map(rate => (
                  <div key={rate.key}>
                    <label className="block text-xs text-gray-400 mb-1">{rate.label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₱</span>
                      <input
                        type="number"
                        name={rate.key}
                        value={newCourt[rate.key]}
                        onChange={handleNewCourtChange}
                        placeholder="0.00"
                        className={`w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30
                          ${fieldErrors[rate.key] 
                              ? "border-red-500 focus:ring-red-300" 
                              : "border-gray-200 focus:ring-primary/30"
                          }`}
                      />
                    </div>
                    {fieldErrors[rate.key] && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors[rate.key]} </span>)}
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
              <button
                onClick={() => setAddModalOpen(false)}
                className="px-5 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCourt}
                className="px-5 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 hover:cursor-pointer"
              >
                Save Court
              </button>
            </div>

          </div>
        </div>
      </Modal>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setIsEditing(false); }} size="lg">
        {selectedCourt && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-2xl font-bold text-primary">
                {isEditing ? "Edit Court" : "Court Details"}
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 hover:cursor-pointer"
                >
                  <EditIcon className="w-4 h-4" /> Edit
                </button>
              )}
            </div>
            <p className="text-sm text-secondary mb-6">
              {isEditing ? "Update the details for this court." : "Check court specifications, rates, and availability"}
            </p>

            <hr className='max-md mb-10 text-secondary/30'/>
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Court Label</label>
                  <input type="text" name="courtLabel" value={editForm.courtLabel} onChange={handleEditChange} readOnly={!isEditing} disabled={!isEditing}
                    className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30
                    ${isEditing && fieldErrors.courtLabel 
                        ? "border-red-500 focus:ring-red-300" 
                        : "border-gray-200 focus:ring-primary/30"
                    }`} />
                    {isEditing && fieldErrors.courtLabel && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.courtLabel} </span>)}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Sport</label>
                  <input type="text" name="courtSport" value={editForm.courtSport} onChange={handleEditChange} readOnly={!isEditing} disabled={!isEditing}
                    className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30
                    ${isEditing && fieldErrors.courtSport 
                        ? "border-red-500 focus:ring-red-300" 
                        : "border-gray-200 focus:ring-primary/30"
                    }`} />
                    {isEditing && fieldErrors.courtSport && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.courtSport} </span>)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Court Type</label>
                  <select name="courtType" value={editForm.courtType} onChange={handleEditChange} readOnly={!isEditing} disabled={!isEditing}
                    className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30
                    ${isEditing && fieldErrors.courtType 
                        ? "border-red-500 focus:ring-red-300" 
                        : "border-gray-200 focus:ring-primary/30"
                    }`}>
                    <option value="">Select type...</option>
                    <option value="Indoor">Indoor</option>
                    <option value="Outdoor">Outdoor</option>
                  </select>
                  {isEditing && fieldErrors.courtType && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.courtType} </span>)}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
                  <select name="isActive" value={editForm.isActive} onChange={handleEditChange} readOnly={!isEditing} disabled={!isEditing}
                    className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30
                    ${isEditing && fieldErrors.isActive 
                        ? "border-red-500 focus:ring-red-300" 
                        : "border-gray-200 focus:ring-primary/30"
                    }`}>
                    <option value={1}>Available</option>
                    <option value={0}>Under Maintenance</option>
                    <option value={2}>Unavailable</option>
                  </select>
                  {isEditing && fieldErrors.isActive && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.isActive} </span>)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description</label>
                <textarea name="courtDesc" value={editForm.courtDesc} onChange={handleEditChange} rows={3} readOnly={!isEditing} disabled={!isEditing}
                  className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none
                    ${isEditing && fieldErrors.courtDesc 
                        ? "border-red-500 focus:ring-red-300" 
                        : "border-gray-200 focus:ring-primary/30"
                    }`} />
                  {isEditing && fieldErrors.courtDesc && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.courtDesc} </span>)}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Pricing Rates</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Weekday AM", key: "rate1" },
                    { label: "Weekday PM", key: "rate2" },
                    { label: "Weekend AM", key: "rate3" },
                    { label: "Weekend PM", key: "rate4" },
                  ].map(rate => (
                    <div key={rate.key}>
                      <label className="block text-xs text-gray-400 mb-1">{rate.label}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₱</span>
                        <input type="number" name={rate.key} value={editForm[rate.key]} onChange={handleEditChange} readOnly={!isEditing} disabled={!isEditing}
                          className={`w-full pl-7 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30
                            ${isEditing && fieldErrors[rate.key]
                                ? "border-red-500 focus:ring-red-300" 
                                : "border-gray-200 focus:ring-primary/30"
                            }`} />
                        {isEditing && fieldErrors[rate.key] && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors[rate.key]} </span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
                {isEditing ? (
                  <>
                    <button onClick={() => {setIsEditing(false); setEditForm(selectedCourt); setFieldErrors({});}}
                      className="px-5 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:cursor-pointer">
                      Cancel
                    </button>
                    <button onClick={handleEditSubmit}
                      className="px-5 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 hover:cursor-pointer">
                      Save Changes
                    </button>
                  </>
                ):(
                  <button onClick={() => { setModalOpen(false); setIsEditing(false); }}
                    className="px-5 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:cursor-pointer">
                    Close
                  </button>
                )}
                
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} size="sm">
        {courtToDelete && (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2Icon className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Delete Court</h2>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-700">{courtToDelete.courtLabel}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 hover:cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};