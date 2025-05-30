import { ComponentType, SVGAttributes } from 'react';

declare module 'react-icons/fa' {
  export interface IconBaseProps extends SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }
  
  export type IconType = ComponentType<IconBaseProps>;
  
  // Navigation and UI icons
  export const FaBars: IconType;
  export const FaTimes: IconType;
  export const FaChevronRight: IconType;
  export const FaChevronDown: IconType;
  export const FaChevronUp: IconType;
  export const FaArrowRight: IconType;
  export const FaArrowLeft: IconType;
  export const FaArrowUp: IconType;
  export const FaArrowDown: IconType;
  export const FaPlus: IconType;
  export const FaMinus: IconType;
  export const FaSearch: IconType;
  export const FaAngleRight: IconType;
  export const FaAngleLeft: IconType;
  export const FaAngleDown: IconType;
  export const FaAngleUp: IconType;
  export const FaEllipsisH: IconType;
  export const FaEllipsisV: IconType;
  
  // Business and contact icons
  export const FaHome: IconType;
  export const FaPhone: IconType;
  export const FaEnvelope: IconType;
  export const FaMapMarkerAlt: IconType;
  export const FaUser: IconType;
  export const FaUserAlt: IconType;
  export const FaUsers: IconType;
  export const FaCalendar: IconType;
  export const FaCalendarAlt: IconType;
  export const FaClock: IconType;
  export const FaStar: IconType;
  export const FaStarHalfAlt: IconType;
  export const FaShareAlt: IconType;
  export const FaThumbsUp: IconType;
  export const FaComments: IconType;
  export const FaQuoteLeft: IconType;
  export const FaQuoteRight: IconType;
  
  // Fitness and health icons
  export const FaHeart: IconType;
  export const FaDumbbell: IconType;
  export const FaAppleAlt: IconType;
  export const FaRunning: IconType;
  export const FaBiking: IconType;
  export const FaSwimmer: IconType;
  export const FaWeight: IconType;
  export const FaMedal: IconType;
  export const FaTrophy: IconType;
  export const FaStopwatch: IconType;
  export const FaHeartbeat: IconType;
  export const FaBurn: IconType;
  export const FaCheck: IconType;
  export const FaCheckCircle: IconType;
  
  // Social media icons
  export const FaInstagram: IconType;
  export const FaFacebook: IconType;
  export const FaFacebookF: IconType;
  export const FaTwitter: IconType;
  export const FaYoutube: IconType;
  export const FaTiktok: IconType;
  export const FaLinkedin: IconType;
  export const FaPinterest: IconType;
  export const FaBlog: IconType;
  
  // Document and content icons
  export const FaFile: IconType;
  export const FaFileAlt: IconType;
  export const FaDownload: IconType;
  export const FaUpload: IconType;
  export const FaPrint: IconType;
  export const FaPencilAlt: IconType;
  export const FaTrash: IconType;
  export const FaEdit: IconType;
  export const FaCopy: IconType;
  export const FaSave: IconType;
  
  // Payment and e-commerce icons
  export const FaCreditCard: IconType;
  export const FaShoppingCart: IconType;
  export const FaTags: IconType;
  export const FaTag: IconType;
  export const FaDollarSign: IconType;
  export const FaMoneyBillAlt: IconType;
  export const FaLock: IconType;
  export const FaShieldAlt: IconType;
}

declare module 'react-icons/ai' {
  export interface IconBaseProps extends SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }
  
  export type IconType = ComponentType<IconBaseProps>;
  
  export const AiFillInstagram: IconType;
  export const AiOutlineTwitter: IconType;
  export const AiFillYoutube: IconType;
  export const AiOutlineMail: IconType;
  export const AiOutlinePhone: IconType;
}

declare module 'react-icons/bs' {
  export interface IconBaseProps extends SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }
  
  export type IconType = ComponentType<IconBaseProps>;
  
  export const BsChevronRight: IconType;
  export const BsArrowRight: IconType;
  export const BsCheck: IconType;
  export const BsCheck2: IconType;
  export const BsCheckCircle: IconType;
  export const BsCheckCircleFill: IconType;
}

declare module 'react-icons/io' {
  export interface IconBaseProps extends SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }
  
  export type IconType = ComponentType<IconBaseProps>;
  
  export const IoLogoInstagram: IconType;
  export const IoMdCheckmark: IconType;
}