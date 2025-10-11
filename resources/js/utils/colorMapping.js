// Shared color mapping for class types and statuses
export const CLASS_TYPE_COLORS = {
    Regular: {
        border: "border-navy-500",
        textColor: "text-navy-600",
        legendColor: "bg-navy-500"
    },
    Premium: {
        border: "border-amber-500",
        textColor: "text-amber-600",
        legendColor: "bg-amber-500"
    },
    Group: {
        border: "border-orange-500",
        textColor: "text-orange-600",
        legendColor: "bg-orange-500"
    }
};

export const CLASS_STATUS_COLORS = {
    // Valid for cancellation (Default/gray)
    "Valid for Cancelation": {
        background: "bg-gray-100",
        hover: "hover:bg-gray-200",
        text: "text-gray-900",
        legendColor: "bg-gray-600",
        legendBorder: "border-gray-700"
    },
    "valid for cancellation": {
        background: "bg-gray-100",
        hover: "hover:bg-gray-200",
        text: "text-gray-900",
        legendColor: "bg-gray-600",
        legendBorder: "border-gray-700"
    },
    "Valid for cancellation": {
        background: "bg-gray-100",
        hover: "hover:bg-gray-200",
        text: "text-gray-900",
        legendColor: "bg-gray-600",
        legendBorder: "border-gray-700"
    },
    // FC not consumed (Yellow)
    "FC not consumed": {
        background: "bg-yellow-100",
        hover: "hover:bg-yellow-200",
        text: "text-yellow-900",
        legendColor: "bg-yellow-400",
        legendBorder: "border-yellow-500"
    },
    "FC not consumed (RG)": {
        background: "bg-yellow-100",
        hover: "hover:bg-yellow-200",
        text: "text-yellow-900",
        legendColor: "bg-yellow-400",
        legendBorder: "border-yellow-500"
    },
    // FC consumed (Pink)
    "FC consumed": {
        background: "bg-pink-100",
        hover: "hover:bg-pink-200",
        text: "text-pink-900",
        legendColor: "bg-pink-400",
        legendBorder: "border-pink-400"
    },
    "FC consumed (RG)": {
        background: "bg-pink-100",
        hover: "hover:bg-pink-200",
        text: "text-pink-900",
        legendColor: "bg-pink-400",
        legendBorder: "border-pink-400"
    },
    // Completed (Green)
    "Completed": {
        background: "bg-green-100",
        hover: "hover:bg-green-200",
        text: "text-green-900",
        legendColor: "bg-green-400",
        legendBorder: "border-green-500"
    },
    "Completed (RG)": {
        background: "bg-green-100",
        hover: "hover:bg-green-200",
        text: "text-green-900",
        legendColor: "bg-green-400",
        legendBorder: "border-green-500"
    },
    "Completed (PRM)": {
        background: "bg-green-100",
        hover: "hover:bg-green-200",
        text: "text-green-900",
        legendColor: "bg-green-400",
        legendBorder: "border-green-500"
    },
    "completed": {
        background: "bg-green-100",
        hover: "hover:bg-green-200",
        text: "text-green-900",
        legendColor: "bg-green-400",
        legendBorder: "border-green-500"
    },
    // Absent w/ntc counted (Blue)
    "Absent w/ntc counted": {
        background: "bg-blue-100",
        hover: "hover:bg-blue-200",
        text: "text-blue-900",
        legendColor: "bg-blue-400",
        legendBorder: "border-blue-500"
    },
    "Absent w/ntc counted (RG)": {
        background: "bg-blue-100",
        hover: "hover:bg-blue-200",
        text: "text-blue-900",
        legendColor: "bg-blue-400",
        legendBorder: "border-blue-500"
    },
    "Absent w/o ntc counted (RG)": {
        background: "bg-blue-100",
        hover: "hover:bg-blue-200",
        text: "text-blue-900",
        legendColor: "bg-blue-400",
        legendBorder: "border-blue-500"
    },
    // Cancelled (Purple)
    "Cancelled": {
        background: "bg-purple-100",
        hover: "hover:bg-purple-200",
        text: "text-purple-900",
        legendColor: "bg-purple-400",
        legendBorder: "border-purple-500"
    },
    "Cancelled (RG)": {
        background: "bg-purple-100",
        hover: "hover:bg-purple-200",
        text: "text-purple-900",
        legendColor: "bg-purple-400",
        legendBorder: "border-purple-500"
    },
    "cancelled": {
        background: "bg-purple-100",
        hover: "hover:bg-purple-200",
        text: "text-purple-900",
        legendColor: "bg-purple-400",
        legendBorder: "border-purple-500"
    },
    // Absent w/ntc-not counted (Orange)
    "Absent w/ntc-not counted": {
        background: "bg-orange-100",
        hover: "hover:bg-orange-200",
        text: "text-orange-900",
        legendColor: "bg-orange-400",
        legendBorder: "border-orange-500"
    },
    "Absent w/ntc-not counted (RG)": {
        background: "bg-orange-100",
        hover: "hover:bg-orange-200",
        text: "text-orange-900",
        legendColor: "bg-orange-400",
        legendBorder: "border-orange-500"
    },
    // Scheduled (Default for unknown status)
    "scheduled": {
        background: "bg-gray-100",
        hover: "hover:bg-gray-200",
        text: "text-gray-900",
        legendColor: "bg-gray-600",
        legendBorder: "border-gray-700"
    },
    // Empty status fallback
    "": {
        background: "bg-gray-100",
        hover: "hover:bg-gray-200",
        text: "text-gray-900",
        legendColor: "bg-gray-600",
        legendBorder: "border-gray-700"
    },
    null: {
        background: "bg-gray-100",
        hover: "hover:bg-gray-200",
        text: "text-gray-900",
        legendColor: "bg-gray-600",
        legendBorder: "border-gray-700"
    },
    undefined: {
        background: "bg-gray-100",
        hover: "hover:bg-gray-200",
        text: "text-gray-900",
        legendColor: "bg-gray-600",
        legendBorder: "border-gray-700"
    }
};

// Helper function to get class type colors
export const getClassTypeColor = (classType) => {
    return CLASS_TYPE_COLORS[classType] || CLASS_TYPE_COLORS.Regular;
};

// Helper function to get class status colors
export const getClassStatusColor = (status) => {
    // Default to gray-600 (rgb(75, 85, 99)) if status is not found
    return CLASS_STATUS_COLORS[status] || {
        background: "bg-gray-100",
        hover: "hover:bg-gray-200",
        text: "text-gray-900",
        legendColor: "bg-gray-600",
        legendBorder: "border-gray-700"
    };
};

// Helper function to get combined class styling
export const getClassStyling = (classType, status) => {
    const typeColor = getClassTypeColor(classType);
    const statusColor = getClassStatusColor(status);
    
    return {
        ...typeColor,
        ...statusColor,
        combinedClasses: `${typeColor.border} ${statusColor.background} ${statusColor.hover} ${statusColor.text}`
    };
};
