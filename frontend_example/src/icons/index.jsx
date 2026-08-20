import {
    FaAngleLeft,
    FaAngleRight,
    FaCheck,
    FaCloud,
    FaClock,
    FaDownload,
    FaEye,
    FaFile,
    FaFileDownload,
    FaFolder,
    FaFolderPlus,
    FaHourglassHalf,
    FaLeaf,
    FaListUl,
    FaMemory,
    FaPen,
    FaPlay,
    FaPlus,
    FaSave,
    FaSpinner,
    FaTimesCircle,
    FaTrash,
    FaUserCircle,
    FaFilePdf,
    FaFileCsv,
    FaImage,
    FaUsers,
    FaUser,
    FaDatabase,
    FaQuestionCircle,
    FaInfoCircle,
    FaFilter,
    FaSearch
} from "react-icons/fa";

// Material Design
import { MdCancel, MdLock  } from "react-icons/md";

// Ionicons
import { IoMdSettings } from "react-icons/io";
import { IoDuplicate  } from "react-icons/io5";

// Feather / Graceful degradation
import { FiCpu, FiRefreshCw  } from "react-icons/fi";
import { GrCpu } from "react-icons/gr";
import { SlEnergy } from "react-icons/sl";

// GitHub Octicons (Go)
import { GoHome, GoSun, GoMoon, GoX, GoCheck } from "react-icons/go";

// Phosphor Icons
import { PiSignOut, PiSignInBold, PiTestTubeFill   } from "react-icons/pi";


import { TbSelector, TbChevronUp , TbChevronDown, TbCategoryFilled, TbChevronRight   } from "react-icons/tb";

import { FaRegCalendar } from "react-icons/fa6";

import { AiFillDatabase } from "react-icons/ai";

export const Icons = {
    // General actions
    Check: FaCheck,
    Cancel: MdCancel,
    Save: FaSave,
    Edit: FaPen,
    Delete: FaTrash,
    Duplicate: IoDuplicate,
    Download: FaDownload,
    FileDownload: FaFileDownload,
    Plus: FaPlus,
    Play: FaPlay,
    Eye: FaEye,
    Question: FaQuestionCircle,
    Info: FaInfoCircle,

    // Navigation
    AngleLeft: FaAngleLeft,
    AngleRight: FaAngleRight,
    Home: GoHome,

    // User
    User: FaUser,
    UserCircle: FaUserCircle,
    SignOut: PiSignOut,

    // Files/Folders
    File: FaFile,
    Folder: FaFolder,
    FolderPlus: FaFolderPlus,
    FilePdf: FaFilePdf,
    FileCsv: FaFileCsv,
    Image: FaImage,

    // UI Elements
    ListUl: FaListUl,
    Search: FaSearch,

    // Status
    Hourglass: FaHourglassHalf,
    TimesCircle: FaTimesCircle,
    Spinner: FaSpinner,

    // Settings
    Settings: IoMdSettings,
    Enter: PiSignInBold  ,

    // Appearance
    Sun: GoSun,
    Moon: GoMoon,

    // System/Performance
    Cpu: FiCpu,
    Gpu: GrCpu,
    Energy: SlEnergy,
    Memory: FaMemory,
    Cloud: FaCloud,
    Leaf: FaLeaf,
    Clock: FaClock,

    // Password icons
    PasswordCheck: GoCheck,
    PasswordX: GoX,
    PasswordLock: MdLock,
    PasswordRefresh: FiRefreshCw,

    // Admin
    Users: FaUsers,
    Database: FaDatabase,
    Test: PiTestTubeFill,
    Category:  TbCategoryFilled,
    Filter: FaFilter,
    Calendar: FaRegCalendar,
    Samples: AiFillDatabase,

    // Table selectors
    Selector: TbSelector,
    ChevronUp: TbChevronUp,
    ChevronDown: TbChevronDown,
    ChevronRight: TbChevronRight
};
