export const addCourtRules = {
    courtLabel: { required: true, }, 
    courtSport: { required: true, }, 
    courtType: { required: true, }, 
    courtDesc: { required: true, }, 
    rate1: { required: true, }, 
    rate2: { required: true, }, 
    rate3: { required: true, }, 
    rate4: { required: true, },
}

export const closureCreateRules = {
    type: { required: true },
    reason: { required: true },
    blackoutDateStart: { required: true },
    blackoutDateEnd: { required: true },
    scope: { required: true },
    courtID: { required: true },
    remarks: { required: false },
}