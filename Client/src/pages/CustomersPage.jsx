import { ArrowRight, EditIcon, Eye, EyeOff, IdCardIcon, PlusCircle, SquareUser, Trash2Icon, User, User2, UserCheck2, UserCog2, UsersRoundIcon } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { StatsGrid } from '../components/StatsGrid'
import { Tabs } from '../components/Tabs'
import { DataTable } from '../components/DataTable'
import { getExportFilename } from '../utils/ExportTable'
import { deleteUser, getAllActiveCustomers, getAllActiveAdmin, registerUserAdmin, registerUserCustomer, updateCustomer } from '../api/services/usersService'
import { shortFormatReadableDate } from '../utils/ValueFormat'
import { Modal } from '../components/Modal'
import { decrypt, encrypt } from '../utils/Crypto'
import { calculateAge } from '../utils/Calculate'
import { validateForm } from '../utils/ValueValidate'
import { userCreateRules, userEditRules } from '../Rules/UserInputRules'
import { toast } from 'sonner'

export const CustomersPage = () => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [activeTab, setActiveTab] = useState("tab1");
  const [customerData, setCustomerData] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [customerError, setCustomerError] = useState(null);
  
  const [adminData, setAdminData] = useState([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);

  const [newUser, setNewUser] = useState({
    age: 0,​ birthDate: "",​ contactNumber: "",​ createdAt: "",​ email: "",​ firstName: "",​ gender: "",​ id: 0,​ isActive: 0,​ lastName: "",​ middleName: "",​ password: "",​ suffix: "",​ userType: "",​ username: "", role: "CUSTOMER" 
  });
  const [editUserForm, setEditUserForm] = useState({
    age: 0,​ birthDate: "",​ contactNumber: "",​ createdAt: "",​ email: "",​ firstName: "",​ gender: "",​ id: 0,​ isActive: 0,​ lastName: "",​ middleName: "",​ password: "",​ suffix: "",​ userID: "",​ userType: "",​ username: "",  
  })

  useEffect(() => {
    const fetchActiveCustomers = async () => {
      try {
        setCustomerLoading(true);
        const customers = await getAllActiveCustomers();
        setCustomerData(customers);
      } catch (err) {
        setCustomerError("Failed to load active customers.");
      } finally {
        setCustomerLoading(false);
      }
    };

    const fetchActiveAdmin = async () => {
      try {
        setAdminLoading(true);
        const admins = await getAllActiveAdmin();
        setAdminData(admins);
      } catch (err) {
        setAdminError("Failed to load active admins.");
      } finally {
        setAdminLoading(false);
      }
    };

    fetchActiveAdmin();
    fetchActiveCustomers();
  }, []);

  const columnsCustomers = useMemo(() => [
    { 
      header: "Customer ID",
      accessorFn: (row) => row.userID,
      cell: ({ row }) => (
        <div className='flex items-center'>
          <div className='w-7 h-7 bg-secondary/50 flex items-center justify-center rounded-full text-white mr-1'>
            <User2 className='w-4 h-4' />
          </div>
          <p className="text-xs">{row.original.userID}</p>
        </div>
      ),
    
    },
    {
      header: "Customer",
      id: "CustomerName",
      accessorFn: (row) => row.firstName,
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-gray-800">{row.original.firstName + " " + row.original.lastName}</p>
          <p className="text-xs text-gray-400">Joined {shortFormatReadableDate(row.original.createdAt)}</p>
        </div>
      ),
    },
    { header: "Username",accessorKey: "username" },
    {
      header: "Contact Info",
      id: "CustomerInfo",
      accessorFn: (row) => row.email,
      cell: ({ row }) => (
        <div>
          <p className="text-gray-800">{row.original.email}</p>
          <p className="text-xs text-gray-400">{row.original.contactNumber}</p>
        </div>
      ),
    },
    { header: "Gender",accessorKey: "gender" },
    { 
      header: "Age",
      accessorKey: "age", 
      cell: ({ row }) => (
        <div>
          <p className="">{calculateAge(row.original.birthDate) + " y/o"}</p>
        </div>
      ),
    },
    { 
      header: "Birthdate",
      accessorKey: "birthDate",
      cell: ({ row }) => (
        <div>
          <p className="">{shortFormatReadableDate(row.original.birthDate)}</p>
        </div>
      ),
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
  ], []);

  const columnsAdmins = useMemo(() => [
    { 
      header: "Staff ID",
      accessorFn: (row) => row.userID,
      cell: ({ row }) => (
        <div className='flex items-center'>
          <div className='w-7 h-7 bg-secondary/50 flex items-center justify-center rounded-full text-white mr-4'>
            <User2 className='w-4 h-4' />
          </div>
          <div>
            <p className="text-xs">{row.original.userID}</p>
            <p className="font-bold text-gray-800">{row.original.firstName + " " + row.original.lastName}</p>
            <p className="text-xs text-gray-400">{shortFormatReadableDate(row.original.createdAt)}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Designation",
      id: "adminDesignation",
      accessorFn: (row) => row.email,
      cell: ({ row }) => (
        <div className='text-center'>
          <span className="inline-flex w-fit px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {row.original.userType}
          </span>
        </div>
      ),
    },
    {
      header: "Email",
      id: "adminAccEmail",
      accessorFn: (row) => row.email,
      cell: ({ row }) => (
        <div>
          <p className="text-gray-800">{row.original.email}</p>
        </div>
      ),
    },
    { header: "Contact Number", accessorKey: "contactNumber" },
    { header: "Gender",accessorKey: "gender" },
    { 
      header: "Age",
      accessorKey: "age", 
      cell: ({ row }) => (
        <div>
          <p className="">{calculateAge(row.original.birthDate) + " y/o"}</p>
        </div>
      ),
    },
    { 
      header: "Birthdate",
      accessorKey: "birthDate",
      cell: ({ row }) => (
        <div>
          <p className="">{shortFormatReadableDate(row.original.birthDate)}</p>
        </div>
      ),
    },
    {
      header: "Actions",
      id: "adminActions",
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
  ], []);

  const userStats = useMemo(() => [
    { icon: UserCheck2, iconColor: "text-primary", label: "Total active users", value: customerData.length + adminData.length },
    { icon: UsersRoundIcon, iconColor: "text-primary", label: "Customers Count", value: customerData.length },
    { icon: UserCog2, iconColor: "text-primary", label: "Staff Count", value: adminData.length },
  ], [customerData.length, adminData.length]);

  const tabs = [
    {
      id: "tab1",
      label: "Customers",
      content: 
        <div>
          <DataTable
              data={customerData}
              columns={columnsCustomers}
              loading={customerLoading}
              error={customerError}
              placeholder="Search customers..."
              pageSize={5}
              exportable={true}
              exportFilename={getExportFilename("RegisteredCustomers")}
            />
        </div>
    },
    {
      id: "tab2",
      label: "Staffs & Admins",
      content: 
        <div>
          <DataTable
              data={adminData}
              columns={columnsAdmins}
              loading={adminLoading}
              error={adminError}
              placeholder="Search users..."
              pageSize={5}
              exportable={true}
              exportFilename={getExportFilename("RegisteredAdminStaffs")}
            />
        </div>
    },
    // {
    //   id: "tab3",
    //   label: "All Users",
    //   content: <div><h1>All Users</h1></div>
    // },
  ]

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditUserForm({ ...user, password: decrypt(user.password) });
    setFieldErrors({}); 
    setIsEditing(false); 
    setModalOpen(true);
    console.log(user)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    const errors = validateForm(editUserForm, userEditRules);
    if (Object.keys(errors).length > 0) {
        setFieldErrors(errors); 
        return;
    }
    
    try {
      const updatedUser = await updateCustomer(selectedUser.id, editUserForm);

      const updater = prev => prev.map(c =>
        c.id === selectedUser.id ? { ...c, ...editUserForm, isActive: Number(editUserForm.isActive), password: encrypt(editUserForm.password) } : c
      );

      selectedUser.userType.toLowerCase() === 'customer' ? setCustomerData(updater) : setAdminData(updater);
      toast.success(updatedUser.message);
      setIsEditing(false);
      setModalOpen(false);
      setEditUserForm({ age: 0,​ birthDate: "",​ contactNumber: "",​ createdAt: "",​ email: "",​ firstName: "",​ gender: "",​ id: 0,​ isActive: 0,​ lastName: "",​ middleName: "",​ password: "",​ suffix: "",​ userID: "",​ userType: "",​ username: "",  })
    } catch (err) {
      toast.error(err.message);
      if (err.errors?.missing) {
        const errors = Object.fromEntries(err.errors.missing.map(f => [f, "This field is required."]));
        setFieldErrors(errors);
      }
    }
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  }

  const confirmDelete = async () => {
    console.log(userToDelete);
    try {
      const data = await deleteUser(userToDelete.id);
      const updater = prev => prev.filter(user => user.id !== userToDelete.id);
      userToDelete.userType.toLowerCase() === 'customer' ? setCustomerData(updater) : setAdminData(updater);
      setDeleteModalOpen(false);
      setUserToDelete(null);
      toast.success(data.message);
    } catch (err) {
      toast.error(data.message);
    }
  }

  const handleNewUserChange = (e) => {
    const {name, value} = e.target;
    setNewUser(prev => ({ ...prev, [name]:value}));
  }

  const handleRegisterUser = async () => {
    const errors = validateForm(newUser, userCreateRules);
    if (Object.keys(errors).length > 0) {
        setFieldErrors(errors); 
        return;
    }

    const isCustomer = newUser.role.toUpperCase() === 'CUSTOMER'; // ✅ define it here
  
    try {
      const added = isCustomer ? await registerUserCustomer(newUser) : await registerUserAdmin(newUser);
      console.log(added);
      const updater = (prev) => [...prev, added.data]; 

      isCustomer ? setCustomerData(updater) : setAdminData(updater);

      toast.success(added.message);
      setAddModalOpen(false);
      setFieldErrors({});
      setNewUser({age: 0,​ birthDate: "",​ contactNumber: "",​ createdAt: "",​ email: "",​ firstName: "",​ gender: "",​ id: 0,​ isActive: 0,​ lastName: "",​ middleName: "",​ password: "",​ suffix: "",​ userType: "",​ username: "", role: "CUSTOMER" });
    } catch (err) {
      toast.error(err.message);
      if (err.errors?.missing) {
        const errors = Object.fromEntries(err.errors.missing.map(f => [f, "This field is required."]));
        setFieldErrors(errors);
      }
    }
  };

  return (
    <>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-primary">User Management</p>
            <p className="text-sm text-secondary"></p>
          </div>
          <button onClick={() => setAddModalOpen(true)}
            className="flex items-center justify-center w-full sm:w-auto px-6 sm:px-10 py-2 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 hover:cursor-pointer">
            <PlusCircle className="w-5 h-5 mr-2" /> Add New User
          </button>
        </div>
      </div>

      <StatsGrid items={userStats} maxCols={4} />

      <div className='pt-5'>
        <Tabs tabs={tabs} defaultTab="tab1" />
      </div>

      <Modal open={addModalOpen} onClose={()=> { setAddModalOpen(false) }} size="xl">
          <div className='mb-10 '>
            <div className='flex flex-col justify-start items-start'>
              <h2 className="text-xl font-bold text-primary mb-1">Add New User</h2>
              <p className="text-sm text-secondary mb-6">Fill in the details to register a new user.</p>
            </div>
            <hr className='max-md mb-10 text-secondary/30'/>
            <div className=''>
              <div className='mt-2'>
                <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Role</span>
              </div>
              <div className='flex items-center gap-2 mt-1 md:px-20'>
                  <button
                      type='button'
                      onClick={() => handleNewUserChange({ target: { name: 'role', value: 'CUSTOMER' } })}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-widest border transition-all duration-200
                          ${newUser.role === 'CUSTOMER' || !newUser.role
                              ? 'bg-primary text-white border-primary shadow-sm'
                              : 'bg-white/60 text-secondary border-gray-200 hover:border-primary/40 hover:cursor-pointer'
                          }`}
                  >
                      Customer
                  </button>
                  <button
                      type='button'
                      onClick={() => handleNewUserChange({ target: { name: 'role', value: 'ADMIN' } })}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-widest border transition-all duration-200
                          ${newUser.role === 'ADMIN'
                              ? 'bg-primary text-white border-primary shadow-sm'
                              : 'bg-white/60 text-secondary border-gray-200 hover:border-primary/40 hover:cursor-pointer'
                          }`}
                  >
                      Admin
                  </button>
              </div>
              {fieldErrors.role && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'> *{fieldErrors.role} </span>)}
            </div>
            <div>
                <div className='flex justify-center items-center w-full mt-7'>
                    <hr className='flex-1 text-secondary/30'/>
                    <span className='ml-5 uppercase text-[9px] text-secondary'>Account Details</span>
                </div>

                <div className='grid max-lg:grid-cols-1 grid-cols-2 min-lg:gap-4'>
                    <div className=''>
                        <div className='mt-2'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Username</span>
                        </div>
                        <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                ${fieldErrors.username 
                                    ? "border-red-500 focus:ring-red-300" 
                                    : "border-gray-200 focus:ring-primary/30"
                                }`}>
                            <input 
                                type="text" 
                                name="username" 
                                id="username"
                                value={newUser.username}
                                onChange={handleNewUserChange}
                                placeholder='e.g JohnDC2026'
                                className={`h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400`}
                            />
                        </div>
                        {fieldErrors.username && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.username} </span>)}
                    </div>
                    <div className=''>
                        <div className='mt-2'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Email</span>
                        </div>
                        <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                ${fieldErrors.email 
                                    ? "border-red-500 focus:ring-red-300" 
                                    : "border-gray-200 focus:ring-primary/30"
                                }`}>
                            <input 
                                type="email" 
                                name="email" 
                                id="email" 
                                value={newUser.email}
                                onChange={handleNewUserChange}
                                placeholder='e.g DelaCruz.John@email.com'
                                className='h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400' 
                            />
                        </div>
                        {fieldErrors.email && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.email} </span>)}
                    </div>
                </div>
                <div className=''>
                    <div className='mt-2'>
                        <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Password</span>
                    </div>
                    <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                ${fieldErrors.password 
                                    ? "border-red-500 focus:ring-red-300" 
                                    : "border-gray-200 focus:ring-primary/30"
                                }`}>
                        <input 
                            type={ isNewPasswordVisible? "text": "password" } 
                            name="password" 
                            id="password" 
                            value={newUser.password}
                            onChange={handleNewUserChange}
                            placeholder='**********'
                            className='h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400' 
                        />
                        <button type='button' className='text-gray-500 hover:text-primary transition-colors duration-200 hover:cursor-pointer' onClick={() => {setIsNewPasswordVisible(!isNewPasswordVisible)}}>
                        { isNewPasswordVisible ? <Eye size={20}/> : <EyeOff size={20}/> }
                        </button>
                    </div>
                    {fieldErrors.password && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.password} </span>)}
                </div>
                
                <div className='flex justify-center items-center w-full mt-7'>
                    <hr className='flex-1 text-secondary/30'/>
                    <span className='ml-5 uppercase text-[9px] text-secondary'>Personal Details</span>
                </div>

                <div className='grid max-lg:grid-cols-1 grid-cols-7 min-lg:gap-4'>
                    <div className='min-lg:col-span-2'>
                        <div className='mt-2'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>First Name</span>
                        </div>
                        <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                ${fieldErrors.firstName 
                                    ? "border-red-500 focus:ring-red-300" 
                                    : "border-gray-200 focus:ring-primary/30"
                                }`}>
                            <input 
                                type="text" 
                                name="firstName" 
                                id="firstName" 
                                value={newUser.firstName}
                                onChange={handleNewUserChange}
                                placeholder='e.g John'
                                className='h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400' 
                            />
                        </div>
                        {fieldErrors.firstName && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.firstName} </span>)}
                    </div>
                    <div className='min-lg:col-span-2'>
                        <div className='mt-2'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>middle Name</span>
                        </div>
                        <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                ${fieldErrors.middleName 
                                    ? "border-red-500 focus:ring-red-300" 
                                    : "border-gray-200 focus:ring-primary/30"
                                }`}>
                            <input 
                                type="text" 
                                name="middleName" 
                                id="middleName" 
                                value={newUser.middleName}
                                onChange={handleNewUserChange}
                                placeholder='e.g Dela Cruz'
                                className='h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400' 
                            />
                        </div>
                        {fieldErrors.middleName && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.middleName} </span>)}
                    </div>
                    <div className='min-lg:col-span-2'>
                        <div className='mt-2'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Last Name</span>
                        </div>
                        <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                ${fieldErrors.lastName 
                                    ? "border-red-500 focus:ring-red-300" 
                                    : "border-gray-200 focus:ring-primary/30"
                                }`}>
                            <input 
                                type="text" 
                                name="lastName" 
                                id="lastName" 
                                value={newUser.lastName}
                                onChange={handleNewUserChange}
                                placeholder='e.g Garcia'
                                className='h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400' 
                            />
                        </div>
                        {fieldErrors.lastName && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.lastName} </span>)}
                    </div>
                    <div className='min-lg:col-span-1'>
                        <div className='mt-2'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Suffix</span>
                        </div>
                        <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                ${fieldErrors.suffix 
                                    ? "border-red-500 focus:ring-red-300" 
                                    : "border-gray-200 focus:ring-primary/30"
                                }`}>
                            <select
                                name='suffix'
                                id="suffix" 
                                value={newUser.suffix}
                                onChange={handleNewUserChange}
                                className='h-7 w-full text-secondary bg-transparent focus:outline-none text-gray-700 text-sm cursor-pointer'
                            >
                                <option value="" disabled>Select suffix</option>
                                <option value="jr">Jr.</option>
                                <option value="sr">Sr.</option>
                                <option value="ii">II</option>
                                <option value="iii">III</option>
                                <option value="iv">IV</option>
                                <option value="">None</option>
                            </select>
                        </div>
                        {fieldErrors.suffix && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.suffix} </span>)}
                    </div>
                </div>

                <div className='grid max-lg:grid-cols-1 grid-cols-3 min-lg:gap-4'>
                    <div className=''>
                        <div className='mt-2'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Birthday</span>
                        </div>
                        <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                ${fieldErrors.birthDate 
                                    ? "border-red-500 focus:ring-red-300" 
                                    : "border-gray-200 focus:ring-primary/30"
                                }`}>
                            <input 
                                type="date"
                                name="birthDate"
                                id="birthDate" 
                                value={newUser.birthDate}
                                onChange={handleNewUserChange}
                                className='h-7 w-full bg-transparent focus:outline-none text-gray-700 cursor-pointer text-secondary'
                            />
                        </div>
                        {fieldErrors.birthDate && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.birthDate} </span>)}
                    </div>
                    <div className=''>
                        <div className='mt-2'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Gender</span>
                        </div>
                        <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                ${fieldErrors.gender 
                                    ? "border-red-500 focus:ring-red-300" 
                                    : "border-gray-200 focus:ring-primary/30"
                                }`}>
                            <select
                                name='gender'
                                id="gender" 
                                value={newUser.gender}
                                onChange={handleNewUserChange}
                                className='h-7 w-full bg-transparent focus:outline-none text-gray-700 text-sm cursor-pointer text-secondary'
                            >
                                <option value="" disabled>Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        {fieldErrors.gender && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.gender} </span>)}
                    </div>
                    <div className=''>
                        <div className='mt-2'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Contact Number</span>
                        </div>
                        <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                ${fieldErrors.contactNumber 
                                    ? "border-red-500 focus:ring-red-300" 
                                    : "border-gray-200 focus:ring-primary/30"
                                }`}>
                            <input 
                                type="text" 
                                name="contactNumber" 
                                id="contactNumber" 
                                value={newUser.contactNumber}
                                onChange={handleNewUserChange}
                                placeholder='09*********'
                                className='h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400' 
                                maxLength={11}
                                onKeyDown={(e) => {
                                    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"]
                                    if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) e.preventDefault()
                                }}
                            />
                        </div>
                        {fieldErrors.contactNumber && (
                            <span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>
                                *{fieldErrors.contactNumber} 
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className='mt-10'>
                <button 
                    onClick={handleRegisterUser}
                    type="button" 
                    className='w-full rounded-2xl h-15 flex justify-center items-center space-x-4 bg-primary text-white shadow-sm hover:shadow-lg hover:bg-primary/90 hover:cursor-pointer'>
                    Add New User <ArrowRight size={20} />
                </button>
            </div>
            </div>
      </Modal>

      <Modal open={modalOpen} onClose={()=> { setModalOpen(false) }} size="md">
        {selectedUser && (
          <>
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-2xl font-bold text-primary">
                  {isEditing ? "Edit User" : "User Details"}
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
                {isEditing ? "Update user details." : "Check account and contact details of a user."}
              </p>
            </div>
            <hr className='text-secondary/30 my-5' />
            <div>
              <div className='flex items-center bg-primary/25 p-5 rounded-xl'>
                <div className='pr-5'>
                  <div className="w-13 h-13 rounded-full bg-secondary-brighter/40 flex items-center justify-center ring-2 ring-white/50 shrink-0">
                    <User className='w-8 h-8 text-secondary'/>
                  </div>
                </div>
                <div className='flex-1 flex items-start justify-between '>
                  <div className='flex flex-col'>
                      <span className='text-secondary uppercase text-[10px]'>
                        <span className="inline-flex w-fit -mx-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                          {editUserForm.userType}
                        </span>
                      </span>
                      <span className='text-primary font-semibold text-sm'>
                        {editUserForm.firstName + " " + editUserForm.middleName.charAt(0).toUpperCase() + ". " + editUserForm.lastName + " " + editUserForm.suffix}
                      </span>
                      <p className='text-secondary text-[10px]'>
                        {editUserForm.userID}
                      </p>
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-secondary uppercase text-[10px]'>date joined</span>
                    <span className='text-primary font-semibold text-sm'>
                      {shortFormatReadableDate(editUserForm.createdAt)}
                    </span>
                    <p className='text-secondary text-[10px]'></p>
                  </div>
                </div>
              </div>
            </div>
            <div className='grid grid-cols-1 gap-4 mt-5 px-3'>
              <div>
                <div className='flex space-x-2 items-center'>
                  <SquareUser className='w-5 h-5 text-primary'/>
                  <span className='uppercase text-sm text-secondary'>
                    account info
                  </span>
                </div>
                <hr className="text-secondary/30 mt-1 mb-5" />
                <div className="flex items-center justify-between space-x-15 my-3">
                  <span className='text-secondary text-sm whitespace-nowrap capitalize'>Username</span>
                  <div className='text-end'>
                    <input type="text" name="username" value={editUserForm.username} onChange={handleEditChange} readOnly={!isEditing} disabled={!isEditing}
                      className={`w-full px-3 py-2 text-sm border border-gray-200 text-end rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30
                        ${isEditing && fieldErrors.username 
                            ? "border-red-500 focus:ring-red-300" 
                            : "border-gray-200 focus:ring-primary/30"
                        }`} />
                    {isEditing && fieldErrors.username && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal '>*{fieldErrors.username} </span>)}
                  </div>
                </div>
                <div className="flex items-center justify-between space-x-15 my-3">
                  <span className='text-secondary text-sm whitespace-nowrap capitalize'>Email Address</span>
                  <div className='text-end'>
                    <input type="text" name="email" value={editUserForm.email} onChange={handleEditChange} readOnly={!isEditing} disabled={!isEditing}
                      className={`w-full px-3 py-2 text-sm border border-gray-200 text-end rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30
                        ${isEditing && fieldErrors.email 
                            ? "border-red-500 focus:ring-red-300" 
                            : "border-gray-200 focus:ring-primary/30"
                        }`} />
                        {isEditing && fieldErrors.email && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal '>*{fieldErrors.email} </span>)}
                  </div>
                </div>
                <div className="flex items-center justify-between space-x-15 my-3">
                  <span className='text-secondary text-sm whitespace-nowrap capitalize'>Password</span>
                  <div className='text-end'>
                    <div className="relative w-full">
                      <input
                        type={showPassword && isEditing ? "text" : "password"}
                        name="password"
                        value={editUserForm.password}
                        onChange={handleEditChange}
                        readOnly={!isEditing}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 pr-8 text-xs border border-gray-200 text-end rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30
                        ${isEditing && fieldErrors.password 
                            ? "border-red-500 focus:ring-red-300" 
                            : "border-gray-200 focus:ring-primary/30"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}  disabled={!isEditing}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {/* {showPassword && isEditing ? <EyeOff size={14} /> : <Eye size={14} />} */}
                        {isEditing && (showPassword ? <Eye size={14}/> : <EyeOff size={14}/>)}
                      </button>
                    </div>
                    {isEditing && fieldErrors.password && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal '>*{fieldErrors.password} </span>)}
                  </div>
                </div>
              </div>
              <div>
                <div className='flex space-x-2 items-center'>
                  <IdCardIcon className='w-5 h-5 text-primary'/>
                  <span className='uppercase text-sm text-secondary'>
                    contact details
                  </span>
                </div>
                <hr className="text-secondary/30 mt-1 mb-5" />
                <div className="flex items-center justify-between space-x-15 my-3">
                  <span className='text-secondary text-sm whitespace-nowrap capitalize'>first Name</span>
                  <div className='text-end'>
                    <input type="text" name="firstName" value={editUserForm.firstName} onChange={handleEditChange} readOnly={!isEditing} disabled={!isEditing}
                      className={`w-full px-3 py-2 text-xs border border-gray-200 text-end rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30
                        ${isEditing && fieldErrors.firstName 
                            ? "border-red-500 focus:ring-red-300" 
                            : "border-gray-200 focus:ring-primary/30"
                        }`} />
                    {isEditing && fieldErrors.firstName && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal '>*{fieldErrors.firstName} </span>)}
                  </div>
                </div>
                <div className="flex items-center justify-between space-x-15 my-3">
                  <span className='text-secondary text-sm whitespace-nowrap capitalize'>middle name</span>
                  <div className='text-end'>
                    <input type="text" name="middleName" value={editUserForm.middleName} onChange={handleEditChange} readOnly={!isEditing} disabled={!isEditing}
                      className={`w-full px-3 py-2 text-xs border border-gray-200 text-end rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30
                        ${isEditing && fieldErrors.middleName 
                            ? "border-red-500 focus:ring-red-300" 
                            : "border-gray-200 focus:ring-primary/30"
                        }`} />
                    {isEditing && fieldErrors.middleName && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal '>*{fieldErrors.middleName} </span>)}
                  </div>
                </div>
                <div className="flex items-center justify-between space-x-15 my-3">
                  <span className='text-secondary text-sm whitespace-nowrap capitalize'>last name</span>
                  <div className='text-end'>
                    <input type="text" name="lastName" value={editUserForm.lastName} onChange={handleEditChange} readOnly={!isEditing} disabled={!isEditing}
                      className={`w-full px-3 py-2 text-xs border border-gray-200 text-end rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30
                        ${isEditing && fieldErrors.lastName 
                            ? "border-red-500 focus:ring-red-300" 
                            : "border-gray-200 focus:ring-primary/30"
                        }`} />
                    {isEditing && fieldErrors.lastName && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal '>*{fieldErrors.lastName} </span>)}
                  </div>
                </div>
                <div className="flex items-center justify-between space-x-15 my-3">
                  <span className='text-secondary text-sm whitespace-nowrap capitalize'>suffix</span>
                  <div className='text-end'>
                    <select name="suffix" value={editUserForm.suffix} onChange={handleEditChange} readOnly={!isEditing} disabled={!isEditing}
                      className={`w-full px-3 py-2 text-xs border border-gray-200 text-end rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30
                        ${isEditing && fieldErrors.suffix 
                            ? "border-red-500 focus:ring-red-300" 
                            : "border-gray-200 focus:ring-primary/30"
                        }`}>
                        <option value="" disabled>Select suffix</option>
                        <option value="jr">Jr.</option>
                        <option value="sr">Sr.</option>
                        <option value="ii">II</option>
                        <option value="iii">III</option>
                        <option value="iv">IV</option>
                        <option value="">None</option>
                    </select>
                    {isEditing && fieldErrors.suffix && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal '>*{fieldErrors.suffix} </span>)}
                  </div>
                </div>
                <div className="flex items-center justify-between space-x-15 my-3">
                  <span className='text-secondary text-sm whitespace-nowrap capitalize'>gender</span>
                  <div className='text-end'>
                    <select name="gender" value={editUserForm.gender} onChange={handleEditChange} readOnly={!isEditing} disabled={!isEditing}
                      className={`w-full px-3 py-2 text-xs border border-gray-200 text-end rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30
                        ${isEditing && fieldErrors.gender 
                            ? "border-red-500 focus:ring-red-300" 
                            : "border-gray-200 focus:ring-primary/30"
                        }`} >
                        <option value="" disabled>Select gender</option>
                        <option value={'Male'}>Male</option>
                        <option value={'Female'}>Female</option>
                    </select>
                    {isEditing && fieldErrors.gender && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal '>*{fieldErrors.gender} </span>)}
                  </div>
                </div>
                <div className="flex items-center justify-between space-x-15 my-3">
                  <span className='text-secondary text-sm whitespace-nowrap capitalize'>birthdate</span>
                  <div className='text-end'>
                    <input type="date" name="birthDate" value={editUserForm.birthDate?.split('T')[0]} onChange={handleEditChange} readOnly={!isEditing} disabled={!isEditing}
                      className={`w-full px-3 py-2 text-xs border border-gray-200 text-end rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30
                        ${isEditing && fieldErrors.birthDate 
                            ? "border-red-500 focus:ring-red-300" 
                            : "border-gray-200 focus:ring-primary/30"
                        }`} />
                    {isEditing && fieldErrors.birthDate && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal '>*{fieldErrors.birthDate} </span>)}
                  </div>  
                </div>
                <div className="flex items-center justify-between space-x-15 my-3">
                  <span className='text-secondary text-sm whitespace-nowrap capitalize'>contact number</span>
                  <div className='text-end'>
                    <input type="text" name="contactNumber" value={editUserForm.contactNumber} onChange={handleEditChange} readOnly={!isEditing} disabled={!isEditing} maxLength={11}
                            onKeyDown={(e) => {
                                const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"]
                                if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) e.preventDefault()
                            }}
                      className={`w-full px-3 py-2 text-xs border border-gray-200 text-end rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30
                        ${isEditing && fieldErrors.contactNumber 
                            ? "border-red-500 focus:ring-red-300" 
                            : "border-gray-200 focus:ring-primary/30"
                        }`} />
                    {isEditing && fieldErrors.contactNumber && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal '>*{fieldErrors.contactNumber} </span>)}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
                {isEditing ? (
                  <>
                    <button onClick={() => {setIsEditing(false); setEditUserForm({ ...selectedUser, password: decrypt(selectedUser.password) }); setFieldErrors({});}}
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
          </>
        )}
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} size="sm">
        {userToDelete && (
          <div className='text-center'>
            <div className='w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4'>
              <Trash2Icon className='w-6 h-6 text-red-600' />
            </div>

            <h2 className="text-lg font-bold text-gray-800 mb-1">Delete User</h2>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-700">{userToDelete.userID}</span>? This action cannot be undone.
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
  )
}


