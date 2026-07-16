import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../service/api";
import { useAuth } from "../context/authContext";
import ParkingGrid from "../components/parkingGrid";

const getErrorMessage = (err, fallback) => err?.response?.data?.message || fallback;

const createUserInitialState = {
    name: "",
    email: "",
    password: "",
    Phone: "",
};

const createCarInitialState = {
    model: "",
    plate: "",
    color: "",
    owner: "",
};

const AdminDashboard = () => {
    const [slots, setSlots] = useState([]);
    const [cars, setCars] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [newSlotNumber, setNewSlotNumber] = useState("");
    const [newSlotFloor, setNewSlotFloor] = useState("1");
    const [newUser, setNewUser] = useState(createUserInitialState);
    const [newCar, setNewCar] = useState(createCarInitialState);
    const [activeCreateForm, setActiveCreateForm] = useState("slot");
    const [assignCarId, setAssignCarId] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { user, logout } = useAuth();

    const isAdmin = user?.role === "admin";
    const currentUserId = user?._id ?? user?.id;

    const fetchData = useCallback(async () => {
        try {
            const [slotsRes, carsRes, usersRes] = await Promise.all([
                api.get("/slot"),
                api.get("/cars"),
                api.get("/users"),
            ]);
            setSlots(Array.isArray(slotsRes.data) ? slotsRes.data : []);
            setCars(Array.isArray(carsRes.data) ? carsRes.data : []);
            setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
            setError("");
        } catch (err) {
            setError(getErrorMessage(err, "Failed to load data"));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    const handleCreateSlot = async (e) => {
        e.preventDefault();
        const trimmed = newSlotNumber.trim();

        if (!trimmed) {
            setError("Slot number can't be empty");
            return;
        }
        if (!/^[A-Za-z0-9-]{1,10}$/.test(trimmed)) {
            setError("Slot number can only contain letters, numbers, and hyphens (max 10 chars)");
            return;
        }
        if (slots.some((s) => s.slotNumber?.toLowerCase() === trimmed.toLowerCase())) {
            setError("A slot with that number already exists");
            return;
        }

        const floorNumber = Number(newSlotFloor);
        if (!Number.isInteger(floorNumber) || floorNumber < 1) {
            setError("Floor must be a whole number, 1 or higher");
            return;
        }

        setSubmitting(true);
        setError("");
        try {
            await api.post("/slot", { slotNumber: trimmed, floor: floorNumber });
            setNewSlotNumber("");
            setNewSlotFloor("1");
            await fetchData();
        } catch (err) {
            setError(getErrorMessage(err, "Could not create slot"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();

        const payload = {
            name: newUser.name.trim(),
            email: newUser.email.trim(),
            password: newUser.password,
            Phone: newUser.Phone.trim(),
        };

        if (!payload.name || !payload.email || !payload.password || !payload.Phone) {
            setError("All user fields are required");
            return;
        }
        if (payload.password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setSubmitting(true);
        setError("");
        try {
            await api.post("/users", payload);
            setNewUser(createUserInitialState);
            await fetchData();
        } catch (err) {
            setError(getErrorMessage(err, "Could not create user"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateCar = async (e) => {
        e.preventDefault();

        const payload = {
            model: newCar.model.trim(),
            plate: newCar.plate.trim(),
            color: newCar.color.trim(),
            owner: newCar.owner,
        };

        if (!payload.model || !payload.plate || !payload.owner) {
            setError("Model, plate, and owner are required");
            return;
        }

        setSubmitting(true);
        setError("");
        try {
            await api.post("/cars", payload);
            setNewCar(createCarInitialState);
            await fetchData();
        } catch (err) {
            setError(getErrorMessage(err, "Could not create car"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleAssign = async () => {
        if (!assignCarId || !selectedSlot?._id) {
            setError("Select a car before assigning");
            return;
        }

        setSubmitting(true);
        setError("");
        try {
            await api.put(`/slot/${selectedSlot._id}/assign`, { carId: assignCarId });
            setSelectedSlot(null);
            setAssignCarId("");
            await fetchData();
        } catch (err) {
            setError(getErrorMessage(err, "Could not assign car"));
        } finally {
            setSubmitting(false);
        }
    };
    const handleChangeFloor = async (slot, floorValue) => {
        const floorNumber = Number(floorValue);
        if (!Number.isInteger(floorNumber) || floorNumber < 1) {
            setError("Floor must be a whole number, 1 or higher");
            return;
        }
        if (floorNumber === slot.floor) return;

        setSubmitting(true);
        setError("");
        try {
            await api.put(`/slot/${slot._id}`, { floor: floorNumber });
            await fetchData();
        } catch (err) {
            setError(getErrorMessage(err, "Could not move slot"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleFree = async (slot) => {
        if (!slot?._id) return;
        const confirmed = window.confirm(
            `Free slot ${slot.slotNumber}? This will remove the assigned car.`
        );
        if (!confirmed) return;

        setSubmitting(true);
        setError("");
        try {
            await api.put(`/slot/${slot._id}/free`);
            setSelectedSlot(null);
            await fetchData();
        } catch (err) {
            setError(getErrorMessage(err, "Could not free slot"));
        } finally {
            setSubmitting(false);
        }
    };
    const handleDeleteSlot = async (slot) => {
        if (!slot?._id) return;

        const warning =
            slot.status === "empty"
                ? `Delete slot ${slot.slotNumber}? This can't be undone.`
                : `Slot ${slot.slotNumber} is currently ${slot.status}. Deleting it removes the slot entirely (the car/reservation record itself is not affected). This can't be undone. Continue?`;

        if (!window.confirm(warning)) return;

        setSubmitting(true);
        setError("");
        try {
            await api.delete(`/slot/${slot._id}`);
            setSelectedSlot(null);
            await fetchData();
        } catch (err) {
            setError(getErrorMessage(err, "Could not delete slot"));
        } finally {
            setSubmitting(false);
        }
    };
    const handleDeleteCar = async (car) => {
        if (!car?._id) return;
        if (!window.confirm(`Delete the car ${car.plate}? This can't be undone.`)) return;

        setSubmitting(true);
        setError("");
        try {
            await api.delete(`/cars/${car._id}`);
            await fetchData();
        } catch (err) {
            setError(getErrorMessage(err, "Could not delete car"));
        } finally {
            setSubmitting(false);
        }
    };
    const handleDeleteUser = async (person) => {
        if (!person?._id) return;
        if (person._id === currentUserId) {
            setError("You can't delete your own account");
            return;
        }
        if (!window.confirm(`Delete ${person.name}'s account? This can't be undone.`)) return;

        setSubmitting(true);
        setError("");
        try {
            await api.delete(`/users/${person._id}`);
            await fetchData();
        } catch (err) {
            setError(getErrorMessage(err, "Could not delete user"));
        } finally {
            setSubmitting(false);
        }
    };

    const parkedCarIds = useMemo(
        () => new Set(slots.filter((s) => s.currentCar).map((s) => s.currentCar._id)),
        [slots]
    );
    const availableCars = cars.filter((car) => !parkedCarIds.has(car._id));
    const createFormTitle =
        activeCreateForm === "slot"
            ? "Add a parking slot"
            : activeCreateForm === "user"
                ? "Add a user"
                : activeCreateForm === "car"
                    ? "Add a car"
                    : "Choose what to add";

    if (!isAdmin) {
        return (
            <div className="page-shell stack">
                <p className="page-error">You don't have permission to view this page.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="page-shell stack">
                <p>Loading dashboard…</p>
            </div>
        );
    }

    return (
        <div className="page-shell stack">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Admin Dashboard — {user?.name}</h2>
                    <p className="page-subtitle">Create slots, assign cars, and clear spaces.</p>
                </div>
                <button className="btn btn--ghost" onClick={logout}>Logout</button>
            </div>

            {error && (
                <p className="page-error" role="alert" aria-live="assertive">
                    {error}
                </p>
            )}

            <div className="admin-actions panel panel--padded">
                <div className="admin-actions__buttons" role="tablist" aria-label="What to add">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeCreateForm === "slot"}
                        className={`btn ${activeCreateForm === "slot" ? "btn--primary" : "btn--ghost"}`}
                        onClick={() => setActiveCreateForm("slot")}
                    >
                        Add Slot
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeCreateForm === "user"}
                        className={`btn ${activeCreateForm === "user" ? "btn--primary" : "btn--ghost"}`}
                        onClick={() => setActiveCreateForm("user")}
                    >
                        Add User
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeCreateForm === "car"}
                        className={`btn ${activeCreateForm === "car" ? "btn--primary" : "btn--ghost"}`}
                        onClick={() => setActiveCreateForm("car")}
                    >
                        Add Car
                    </button>
                </div>

                <div className="admin-actions__form">
                    <h3 className="page-title page-title--compact">{createFormTitle}</h3>

                    {activeCreateForm === "slot" && (
                        <form onSubmit={handleCreateSlot} className="slot-form">
                            <div className="field-group">
                                <label htmlFor="slot-number" className="field-label">
                                    Slot number
                                </label>
                                <input
                                    id="slot-number"
                                    className="input"
                                    placeholder="e.g. A1"
                                    value={newSlotNumber}
                                    maxLength={10}
                                    onChange={(e) => setNewSlotNumber(e.target.value)}
                                    disabled={submitting}
                                />
                            </div>
                            <div className="field-group">
                                <label htmlFor="slot-floor" className="field-label">
                                    Floor
                                </label>
                                <input
                                    id="slot-floor"
                                    className="input input--floor-number"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={newSlotFloor}
                                    onChange={(e) => setNewSlotFloor(e.target.value)}
                                    disabled={submitting}
                                />
                            </div>
                            <button className="btn btn--primary" type="submit" disabled={submitting}>
                                {submitting ? "Creating…" : "Create Slot"}
                            </button>
                        </form>
                    )}

                    {activeCreateForm === "user" && (
                        <form onSubmit={handleCreateUser} className="admin-form-grid">
                            <div className="field-group">
                                <label htmlFor="user-name" className="field-label">Full name</label>
                                <input
                                    id="user-name"
                                    className="input"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser((current) => ({ ...current, name: e.target.value }))}
                                    disabled={submitting}
                                />
                            </div>
                            <div className="field-group">
                                <label htmlFor="user-email" className="field-label">Email address</label>
                                <input
                                    id="user-email"
                                    className="input"
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser((current) => ({ ...current, email: e.target.value }))}
                                    disabled={submitting}
                                />
                            </div>
                            <div className="field-group">
                                <label htmlFor="user-password" className="field-label">Password</label>
                                <input
                                    id="user-password"
                                    className="input"
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser((current) => ({ ...current, password: e.target.value }))}
                                    disabled={submitting}
                                    aria-describedby="user-password-hint"
                                />
                                <span id="user-password-hint" className="field-hint">
                                    At least 8 characters
                                </span>
                            </div>
                            <div className="field-group">
                                <label htmlFor="user-phone" className="field-label">Phone number</label>
                                <input
                                    id="user-phone"
                                    className="input"
                                    value={newUser.Phone}
                                    onChange={(e) => setNewUser((current) => ({ ...current, Phone: e.target.value }))}
                                    disabled={submitting}
                                />
                            </div>
                            <button className="btn btn--primary" type="submit" disabled={submitting}>
                                {submitting ? "Creating…" : "Create User"}
                            </button>
                        </form>
                    )}

                    {activeCreateForm === "car" && (
                        <form onSubmit={handleCreateCar} className="admin-form-grid">
                            <div className="field-group">
                                <label htmlFor="car-model" className="field-label">Car model</label>
                                <input
                                    id="car-model"
                                    className="input"
                                    value={newCar.model}
                                    onChange={(e) => setNewCar((current) => ({ ...current, model: e.target.value }))}
                                    disabled={submitting}
                                />
                            </div>
                            <div className="field-group">
                                <label htmlFor="car-plate" className="field-label">Plate number</label>
                                <input
                                    id="car-plate"
                                    className="input"
                                    value={newCar.plate}
                                    onChange={(e) => setNewCar((current) => ({ ...current, plate: e.target.value }))}
                                    disabled={submitting}
                                />
                            </div>
                            <div className="field-group">
                                <label htmlFor="car-color" className="field-label">Color</label>
                                <input
                                    id="car-color"
                                    className="input"
                                    value={newCar.color}
                                    onChange={(e) => setNewCar((current) => ({ ...current, color: e.target.value }))}
                                    disabled={submitting}
                                />
                            </div>
                            <div className="field-group">
                                <label htmlFor="car-owner" className="field-label">Owner</label>
                                <select
                                    id="car-owner"
                                    className="select"
                                    value={newCar.owner}
                                    onChange={(e) => setNewCar((current) => ({ ...current, owner: e.target.value }))}
                                    disabled={submitting}
                                >
                                    <option value="">Select owner</option>
                                    {users.map((person) => (
                                        <option key={person._id} value={person._id}>
                                            {person.name} ({person.Phone})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button className="btn btn--primary" type="submit" disabled={submitting}>
                                {submitting ? "Creating…" : "Create Car"}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <ParkingGrid slots={slots} onSlotClick={setSelectedSlot} />

            {selectedSlot && (
                <div className="panel panel--padded">
                    <h4 className="page-title page-title--compact">
                        Manage Slot {selectedSlot.slotNumber}
                    </h4>

                    <div className="field-group">
                        <label htmlFor="slot-floor-edit" className="field-label">Floor</label>
                        <input
                            id="slot-floor-edit"
                            className="input input--floor-number"
                            type="number"
                            min="1"
                            step="1"
                            defaultValue={selectedSlot.floor ?? 1}
                            key={selectedSlot._id}
                            onBlur={(e) => handleChangeFloor(selectedSlot, e.target.value)}
                            disabled={submitting}
                            aria-describedby="slot-floor-edit-hint"
                        />
                        <span id="slot-floor-edit-hint" className="field-hint">
                            Change and click elsewhere to move this slot
                        </span>
                    </div>

                    <div className="field-group">
                        <label htmlFor="assign-car" className="field-label">Assign a car to this slot</label>
                        <select
                            id="assign-car"
                            className="select"
                            value={assignCarId}
                            onChange={(e) => setAssignCarId(e.target.value)}
                            disabled={submitting}
                        >
                            <option value="">-- Select a car --</option>
                            {availableCars.map((car) => (
                                <option key={car._id} value={car._id}>
                                    {car.plate} ({car.model})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="slot-actions">
                        <button
                            className="btn btn--primary"
                            onClick={handleAssign}
                            disabled={submitting || !assignCarId}
                        >
                            Assign Car
                        </button>
                        <button
                            className="btn btn--danger"
                            onClick={() => handleFree(selectedSlot)}
                            disabled={submitting}
                        >
                            Free Slot
                        </button>
                        <button
                            className="btn btn--danger"
                            onClick={() => handleDeleteSlot(selectedSlot)}
                            disabled={submitting}
                        >
                            Delete Slot
                        </button>
                        <button
                            className="btn btn--ghost"
                            onClick={() => setSelectedSlot(null)}
                            disabled={submitting}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            <div className="panel panel--padded stack">
                <h3 className="page-title page-title--compact">Cars</h3>
                {cars.length === 0 ? (
                    <p className="page-subtitle">No cars yet.</p>
                ) : (
                    <ul className="manage-list">
                        {cars.map((car) => (
                            <li key={car._id} className="manage-list__row">
                                <span className="manage-list__info">
                                    <strong>{car.plate}</strong> — {car.model}
                                    {car.color ? ` (${car.color})` : ""}
                                    {car.owner?.name ? ` · owner: ${car.owner.name}` : ""}
                                </span>
                                <button
                                    type="button"
                                    className="btn btn--danger"
                                    onClick={() => handleDeleteCar(car)}
                                    disabled={submitting}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="panel panel--padded stack">
                <h3 className="page-title page-title--compact">Users</h3>
                {users.length === 0 ? (
                    <p className="page-subtitle">No users yet.</p>
                ) : (
                    <ul className="manage-list">
                        {users.map((person) => {
                            const isSelf = person._id === currentUserId;
                            return (
                                <li key={person._id} className="manage-list__row">
                                    <span className="manage-list__info">
                                        <strong>{person.name}</strong> — {person.Phone}
                                        {person.role === "admin" ? " · admin" : ""}
                                        {isSelf ? " (you)" : ""}
                                    </span>
                                    <button
                                        type="button"
                                        className="btn btn--danger"
                                        onClick={() => handleDeleteUser(person)}
                                        disabled={submitting || isSelf}
                                        title={isSelf ? "You can't delete your own account" : undefined}
                                    >
                                        Delete
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
