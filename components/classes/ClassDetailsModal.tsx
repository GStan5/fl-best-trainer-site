import React from "react";import React from 'react';export default function ClassDetailsModal({ classData, isOpen, onClose, onAddParticipant, onRemoveParticipant }) {import React from "react";import React from "react";import { motion, AnimatePresence } from "framer-motion";

import { motion, AnimatePresence } from "framer-motion";

import {

  FaTimes,

  FaCalendarAlt,interface Class {  if (!isOpen || !classData) return null;

  FaClock,

  FaMapMarkerAlt,  id?: string;

  FaUsers,

  FaDollarSign,  title: string;

  FaInfo,

  FaEdit,  description: string;

  FaTrash,

  FaUserPlus,  instructor: string;  const currentParticipants = classData.current_participants || 0;

  FaUserMinus,

  FaDumbbell,  date: string;

  FaExclamationTriangle,

} from "react-icons/fa";  start_time: string;  const pricePerSession = Number(classData.price_per_session) || 0;interface Class {import {



interface Class {  end_time: string;

  id?: string;

  title: string;  max_participants: number;

  description: string;

  instructor: string;  current_participants?: number;

  date: string;

  start_time: string;  location: string;  return (  id?: string;

  end_time: string;

  max_participants: number;  class_type: string;

  current_participants?: number;

  location: string;  difficulty_level?: string;    <div 

  class_type: string;

  difficulty_level?: string;  equipment_needed?: string;

  equipment_needed?: string;

  prerequisites?: string;  prerequisites?: string;      style={{   title: string;interface Class {  FaTimes,

  price_per_session?: number;

  is_active?: boolean;  price_per_session?: number;

  is_recurring?: boolean;

  recurring_days?: string[];  is_active?: boolean;        position: 'fixed',

  class_goals?: string;

  intensity_level?: string;  is_recurring?: boolean;

  waitlist_enabled?: boolean;

  waitlist_capacity?: number;  recurring_days?: string[];        top: 0,  description: string;

  auto_confirm_booking?: boolean;

  cancellation_deadline_hours?: number;}

  safety_requirements?: string;

  age_restrictions?: string;        left: 0,

  modifications_available?: string;

  credits_required?: number;interface ClassDetailsModalProps {

  duration_minutes?: number;

}  isOpen: boolean;        right: 0,  instructor: string;  id?: string;  FaUsers,



interface ClassDetailsModalProps {  onClose: () => void;

  isOpen: boolean;

  onClose: () => void;  classData: Class | null;        bottom: 0,

  classData: Class | null;

  onAddParticipant?: (classId: string) => void;}

  onRemoveParticipant?: (classId: string) => void;

  onEditClass?: (classData: Class) => void;        backgroundColor: 'rgba(0, 0, 0, 0.8)',  date: string;

  onDeleteClass?: (classId: string) => void;

  isAdmin?: boolean;export default function ClassDetailsModal({ classData, isOpen, onClose }: ClassDetailsModalProps) {

}

  if (!isOpen || !classData) return null;        zIndex: 99999,

export default function ClassDetailsModal({ 

  classData, 

  isOpen, 

  onClose,  const currentParticipants = classData.current_participants || 0;        display: 'flex',  start_time: string;  title: string;  FaCalendarAlt,

  onAddParticipant,

  onRemoveParticipant,  const pricePerSession = Number(classData.price_per_session) || 0;

  onEditClass,

  onDeleteClass,        alignItems: 'center',

  isAdmin = false

}: ClassDetailsModalProps) {  return (

  if (!isOpen || !classData) return null;

    <div         justifyContent: 'center',  end_time: string;

  const currentParticipants = classData.current_participants || 0;

  const pricePerSession = Number(classData.price_per_session) || 0;      style={{ 



  // Parse date safely to avoid timezone issues        position: 'fixed',        padding: '1rem'

  const formatDate = (dateString: string) => {

    const dateStr = dateString.split("T")[0]; // Get "2025-10-09"        top: 0,

    const [year, month, day] = dateStr.split("-").map(Number);

    const localDate = new Date(year, month - 1, day);        left: 0,      }}  max_participants: number;  description: string;  FaClock,

    return localDate.toLocaleDateString('en-US', {

      weekday: 'long',        right: 0,

      year: 'numeric',

      month: 'long',        bottom: 0,      onClick={(e) => {

      day: 'numeric'

    });        backgroundColor: 'rgba(0, 0, 0, 0.8)',

  };

        zIndex: 99999,        if (e.target === e.currentTarget) {  current_participants?: number;

  const getLocationColorClass = (location: string) => {

    switch (location.toLowerCase()) {        display: 'flex',

      case 'gym': return 'text-blue-400';

      case 'studio': return 'text-purple-400';        alignItems: 'center',          onClose();

      case 'outdoor': return 'text-green-400';

      case 'pool': return 'text-cyan-400';        justifyContent: 'center',

      default: return 'text-slate-300';

    }        padding: '1rem'        }  location: string;  instructor: string;  FaMapMarkerAlt,

  };

      }}

  const getDifficultyColor = (difficulty?: string) => {

    switch (difficulty?.toLowerCase()) {      onClick={(e) => {      }}

      case 'beginner': return 'bg-green-500';

      case 'intermediate': return 'bg-yellow-500';        if (e.target === e.currentTarget) {

      case 'advanced': return 'bg-red-500';

      default: return 'bg-gray-500';          onClose();    >  class_type: string;

    }

  };        }



  const handlePrintDetails = () => {      }}      <div 

    const printWindow = window.open('', '_blank');

    if (printWindow) {    >

      printWindow.document.write(`

        <html>      <div         style={{   difficulty_level?: string;  date: string;  FaDollarSign,

        <head>

          <title>${classData.title} - Class Details</title>        style={{ 

          <style>

            body { font-family: Arial, sans-serif; margin: 20px; }          backgroundColor: 'white',          backgroundColor: 'white',

            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }

            .detail { margin: 10px 0; }          color: 'black',

            .label { font-weight: bold; }

            .close-btn {           padding: '2rem',          color: 'black',  equipment_needed?: string;

              position: fixed; top: 10px; right: 10px; 

              background: #f44336; color: white; border: none;           borderRadius: '8px',

              padding: 10px 15px; border-radius: 5px; cursor: pointer; 

            }          maxWidth: '500px',          padding: '2rem',

          </style>

        </head>          width: '100%',

        <body>

          <button class="close-btn" onclick="window.close()">✕ Close</button>          maxHeight: '80vh',          borderRadius: '8px',  prerequisites?: string;  start_time: string;  FaUserPlus,

          <div class="header">

            <h1>${classData.title}</h1>          overflowY: 'auto'

            <h3>with ${classData.instructor}</h3>

          </div>        }}          maxWidth: '500px',

          <div class="detail"><span class="label">Date:</span> ${formatDate(classData.date)}</div>

          <div class="detail"><span class="label">Time:</span> ${classData.start_time} - ${classData.end_time}</div>        onClick={(e) => e.stopPropagation()}

          <div class="detail"><span class="label">Location:</span> ${classData.location}</div>

          <div class="detail"><span class="label">Type:</span> ${classData.class_type}</div>      >          width: '100%',  price_per_session?: number;

          <div class="detail"><span class="label">Difficulty:</span> ${classData.difficulty_level || 'Not specified'}</div>

          <div class="detail"><span class="label">Participants:</span> ${currentParticipants} / ${classData.max_participants}</div>        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>

          <div class="detail"><span class="label">Price:</span> $${pricePerSession.toFixed(2)} per session</div>

          ${classData.description ? `<div class="detail"><span class="label">Description:</span> ${classData.description}</div>` : ''}          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Class Details</h2>          maxHeight: '80vh',

          ${classData.equipment_needed ? `<div class="detail"><span class="label">Equipment:</span> ${classData.equipment_needed}</div>` : ''}

          ${classData.prerequisites ? `<div class="detail"><span class="label">Prerequisites:</span> ${classData.prerequisites}</div>` : ''}          <button 

          ${classData.class_goals ? `<div class="detail"><span class="label">Goals:</span> ${classData.class_goals}</div>` : ''}

          ${classData.safety_requirements ? `<div class="detail"><span class="label">Safety:</span> ${classData.safety_requirements}</div>` : ''}            onClick={onClose}          overflowY: 'auto'  is_active?: boolean;  end_time: string;  FaUserMinus,

          ${classData.age_restrictions ? `<div class="detail"><span class="label">Age Restrictions:</span> ${classData.age_restrictions}</div>` : ''}

          ${classData.is_recurring && classData.recurring_days ? `<div class="detail"><span class="label">Recurring Days:</span> ${classData.recurring_days.join(', ')}</div>` : ''}            style={{ 

        </body>

        </html>              backgroundColor: '#ef4444',        }}

      `);

      printWindow.document.close();              color: 'white',

      printWindow.focus();

    }              padding: '0.5rem 1rem',        onClick={(e) => e.stopPropagation()}  is_recurring?: boolean;

  };

              border: 'none',

  return (

    <AnimatePresence>              borderRadius: '4px',      >

      {isOpen && (

        <div              cursor: 'pointer',

          style={{

            position: 'fixed',              fontSize: '0.875rem'        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>  recurring_days?: string[];  max_participants: number;  FaInfo,

            top: 0,

            left: 0,            }}

            right: 0,

            bottom: 0,          >          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Class Details</h2>

            backgroundColor: 'rgba(0, 0, 0, 0.8)',

            zIndex: 99999,            ✕

            display: 'flex',

            alignItems: 'center',          </button>          <button }

            justifyContent: 'center',

            padding: '1rem'        </div>

          }}

          onClick={(e) => {            onClick={onClose}

            if (e.target === e.currentTarget) {

              onClose();        <div style={{ display: 'grid', gap: '1rem' }}>

            }

          }}          <div>            style={{   current_participants?: number;  FaExclamationTriangle,

        >

          <motion.div            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>

            initial={{ scale: 0.9, opacity: 0 }}

            animate={{ scale: 1, opacity: 1 }}              {classData.title}              backgroundColor: '#ef4444',

            exit={{ scale: 0.9, opacity: 0 }}

            className="bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto"            </h3>

          >

            {/* Header */}            <p style={{ color: '#666', marginBottom: '1rem' }}>              color: 'white',interface ClassDetailsModalProps {

            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-700">

              <div className="flex-1">              {classData.description}

                <div className="flex items-center gap-3 mb-2">

                  <h2 className="text-xl font-bold text-white">{classData.title}</h2>            </p>              padding: '0.5rem 1rem',

                  {classData.difficulty_level && (

                    <span className={`px-2 py-1 text-xs text-white rounded-full ${getDifficultyColor(classData.difficulty_level)}`}>          </div>

                      {classData.difficulty_level}

                    </span>              border: 'none',  classData: Class | null;  location: string;} from "react-icons/fa";

                  )}

                  {classData.is_recurring && (          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                    <span className="px-2 py-1 text-xs bg-purple-500 text-white rounded-full">

                      Recurring            <div>              borderRadius: '4px',

                    </span>

                  )}              <strong>Instructor:</strong> {classData.instructor}

                </div>

                <p className="text-slate-400">with {classData.instructor}</p>            </div>              cursor: 'pointer'  isOpen: boolean;

              </div>

              <button            <div>

                onClick={onClose}

                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"              <strong>Location:</strong> {classData.location}            }}

              >

                <FaTimes />            </div>

              </button>

            </div>            <div>          >  onClose: () => void;  class_type: string;



            {/* Content */}              <strong>Date:</strong> {classData.date}

            <div className="p-6 space-y-6">

              {/* Basic Info Grid */}            </div>            ✕

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Date & Time */}            <div>

                <div className="space-y-2">

                  <div className="flex items-center text-slate-400">              <strong>Time:</strong> {classData.start_time} - {classData.end_time}          </button>  onAddParticipant: (classId: string) => void;

                    <FaCalendarAlt className="mr-2" />

                    <span className="font-medium">Date</span>            </div>

                  </div>

                  <div className="text-white">            <div>        </div>

                    <div className="font-medium">

                      {formatDate(classData.date)}              <strong>Class Type:</strong> {classData.class_type}

                    </div>

                  </div>            </div>          onRemoveParticipant: (classId: string) => void;  difficulty_level?: string;interface Class {

                </div>

            <div>

                {/* Time */}

                <div className="space-y-2">              <strong>Difficulty:</strong> {classData.difficulty_level || 'Not specified'}        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

                  <div className="flex items-center text-slate-400">

                    <FaClock className="mr-2" />            </div>

                    <span className="font-medium">Time</span>

                  </div>          </div>          <p><strong>Title:</strong> {classData.title}</p>}

                  <div className="text-white font-medium">

                    {classData.start_time} - {classData.end_time}

                    {classData.duration_minutes && (

                      <span className="text-slate-400 text-sm ml-2">          <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '1rem' }}>          <p><strong>Type:</strong> {classData.class_type}</p>

                        ({classData.duration_minutes} min)

                      </span>            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

                    )}

                  </div>              <div>          <p><strong>Date:</strong> {classData.date}</p>  equipment_needed?: string;  id?: string;

                </div>

                <strong>Participants:</strong> {currentParticipants} / {classData.max_participants}

                {/* Location */}

                <div className="space-y-2">              </div>          <p><strong>Time:</strong> {classData.start_time} - {classData.end_time}</p>

                  <div className="flex items-center text-slate-400">

                    <FaMapMarkerAlt className="mr-2" />              <div>

                    <span className="font-medium">Location</span>

                  </div>                <strong>Price:</strong> ${pricePerSession.toFixed(2)}          <p><strong>Location:</strong> {classData.location}</p>export default function ClassDetailsModal({

                  <div className={`font-medium ${getLocationColorClass(classData.location)}`}>

                    {classData.location}              </div>

                  </div>

                </div>            </div>          <p><strong>Participants:</strong> {currentParticipants} / {classData.max_participants}</p>



                {/* Price */}

                <div className="space-y-2">

                  <div className="flex items-center text-slate-400">            {classData.equipment_needed && (          <p><strong>Price:</strong> ${pricePerSession.toFixed(2)}</p>  classData,  prerequisites?: string;  title: string;

                    <FaDollarSign className="mr-2" />

                    <span className="font-medium">Price</span>              <div style={{ marginBottom: '1rem' }}>

                  </div>

                  <div className="text-white font-medium">                <strong>Equipment Needed:</strong> {classData.equipment_needed}          

                    ${pricePerSession.toFixed(2)} per session

                    {classData.credits_required && (              </div>

                      <div className="text-slate-400 text-sm">

                        or {classData.credits_required} credits            )}          {classData.description && (  isOpen,

                      </div>

                    )}

                  </div>

                </div>            {classData.prerequisites && (            <div>

              </div>

              <div style={{ marginBottom: '1rem' }}>

              {/* Description */}

              {classData.description && (                <strong>Prerequisites:</strong> {classData.prerequisites}              <strong>Description:</strong>  onClose,  price_per_session?: number;  description: string;

                <div className="space-y-2">

                  <div className="flex items-center text-slate-400">              </div>

                    <FaInfo className="mr-2" />

                    <span className="font-medium">Description</span>            )}              <p style={{ marginTop: '0.25rem' }}>{classData.description}</p>

                  </div>

                  <p className="text-slate-300 leading-relaxed">{classData.description}</p>

                </div>

              )}            {classData.is_recurring && classData.recurring_days && (            </div>  onAddParticipant,



              {/* Class Goals */}              <div>

              {classData.class_goals && (

                <div className="space-y-2">                <strong>Recurring Days:</strong> {classData.recurring_days.join(', ')}          )}

                  <div className="flex items-center text-slate-400">

                    <FaDumbbell className="mr-2" />              </div>

                    <span className="font-medium">Class Goals</span>

                  </div>            )}            onRemoveParticipant,  is_active?: boolean;  instructor: string;

                  <p className="text-slate-300 leading-relaxed">{classData.class_goals}</p>

                </div>          </div>

              )}

        </div>          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>

              {/* Participants */}

              <div className="space-y-2">      </div>

                <div className="flex items-center text-slate-400">

                  <FaUsers className="mr-2" />    </div>            {classData.id && (}: ClassDetailsModalProps) {

                  <span className="font-medium">Participants</span>

                </div>  );

                <div className="text-white">

                  {currentParticipants} / {classData.max_participants} participants}              <>

                  {classData.waitlist_enabled && classData.waitlist_capacity && (

                    <span className="text-slate-400 text-sm ml-2">                <button  console.log("🎭 Modal Debug:", { isOpen, hasClassData: !!classData, classDataTitle: classData?.title });  is_recurring?: boolean;  date: string;

                      (Waitlist: {classData.waitlist_capacity})

                    </span>                  onClick={() => onAddParticipant(classData.id)}

                  )}

                </div>                  disabled={currentParticipants >= classData.max_participants}

                <div className="w-full bg-slate-700 rounded-full h-2">

                  <div                   style={{ 

                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"

                    style={{ width: `${Math.min((currentParticipants / classData.max_participants) * 100, 100)}%` }}                    backgroundColor: currentParticipants >= classData.max_participants ? '#9ca3af' : '#10b981',  if (!isOpen) {  recurring_days?: string[];  start_time: string;

                  />

                </div>                    color: 'white',

                {currentParticipants >= classData.max_participants && (

                  <div className="flex items-center text-red-400 text-sm">                    padding: '0.5rem 1rem',    console.log("🚨 Not showing - isOpen is false");

                    <FaExclamationTriangle className="mr-1" />

                    Class is full                    border: 'none',

                  </div>

                )}                    borderRadius: '4px',    return null;}  end_time: string;

              </div>

                    cursor: currentParticipants >= classData.max_participants ? 'not-allowed' : 'pointer'

              {/* Additional Details */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">                  }}  }

                {classData.class_type && (

                  <div>                >

                    <span className="text-slate-400">Type:</span>

                    <span className="text-white ml-2">{classData.class_type}</span>                  Add Participant  max_participants: number;

                  </div>

                )}                </button>

                {classData.intensity_level && (

                  <div>                <button  if (!classData) {

                    <span className="text-slate-400">Intensity:</span>

                    <span className="text-white ml-2">{classData.intensity_level}</span>                  onClick={() => onRemoveParticipant(classData.id)}

                  </div>

                )}                  disabled={currentParticipants <= 0}    console.log("🚨 Not showing - no classData");interface ClassDetailsModalProps {  current_participants?: number;

                {classData.equipment_needed && (

                  <div>                  style={{ 

                    <span className="text-slate-400">Equipment:</span>

                    <span className="text-white ml-2">{classData.equipment_needed}</span>                    backgroundColor: currentParticipants <= 0 ? '#9ca3af' : '#f97316',    return null;

                  </div>

                )}                    color: 'white',

                {classData.prerequisites && (

                  <div>                    padding: '0.5rem 1rem',  }  classData: Class | null;  location: string;

                    <span className="text-slate-400">Prerequisites:</span>

                    <span className="text-white ml-2">{classData.prerequisites}</span>                    border: 'none',

                  </div>

                )}                    borderRadius: '4px',

                {classData.age_restrictions && (

                  <div>                    cursor: currentParticipants <= 0 ? 'not-allowed' : 'pointer'

                    <span className="text-slate-400">Age Restrictions:</span>

                    <span className="text-white ml-2">{classData.age_restrictions}</span>                  }}  console.log("✅ Rendering modal with data:", classData.title);  isOpen: boolean;  class_type: string;

                  </div>

                )}                >

                {classData.modifications_available && (

                  <div>                  Remove Participant

                    <span className="text-slate-400">Modifications:</span>

                    <span className="text-white ml-2">{classData.modifications_available}</span>                </button>

                  </div>

                )}              </>  const currentParticipants = classData.current_participants || 0;  onClose: () => void;  difficulty_level?: string;

                {classData.safety_requirements && (

                  <div>            )}

                    <span className="text-slate-400">Safety Requirements:</span>

                    <span className="text-white ml-2">{classData.safety_requirements}</span>          </div>  const pricePerSession = Number(classData.price_per_session) || 0;

                  </div>

                )}        </div>

                {classData.cancellation_deadline_hours && (

                  <div>      </div>  onAddParticipant: (classId: string) => void;  equipment_needed?: string;

                    <span className="text-slate-400">Cancellation Deadline:</span>

                    <span className="text-white ml-2">{classData.cancellation_deadline_hours} hours before</span>    </div>

                  </div>

                )}  );  return (

              </div>

}

              {/* Recurring Information */}    <div   onRemoveParticipant: (classId: string) => void;  prerequisites?: string;

              {classData.is_recurring && classData.recurring_days && classData.recurring_days.length > 0 && (

                <div className="space-y-2">      className="fixed inset-0 flex items-center justify-center p-4"

                  <div className="flex items-center text-slate-400">

                    <FaCalendarAlt className="mr-2" />      style={{ }  price_per_session?: number;

                    <span className="font-medium">Recurring Schedule</span>

                  </div>        backgroundColor: 'rgba(0, 0, 0, 0.8)', 

                  <div className="text-white">

                    Every {classData.recurring_days.map(day =>         zIndex: 99999,  is_active?: boolean;

                      day.charAt(0).toUpperCase() + day.slice(1)

                    ).join(', ')}        position: 'fixed',

                  </div>

                </div>        top: 0,export default function ClassDetailsModal({  is_recurring?: boolean;

              )}

        left: 0,

              {/* Action Buttons */}

              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-700">        right: 0,  classData,  recurring_days?: string[];

                {/* Print Details */}

                <button        bottom: 0

                  onClick={handlePrintDetails}

                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"      }}  isOpen,}

                >

                  Print Details      onClick={(e) => {

                </button>

        if (e.target === e.currentTarget) {  onClose,

                {/* Admin Actions */}

                {isAdmin && classData.id && (          onClose();

                  <>

                    {onEditClass && (        }  onAddParticipant,interface ClassDetailsModalProps {

                      <button

                        onClick={() => onEditClass(classData)}      }}

                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"

                      >    >  onRemoveParticipant,  classData: Class | null;

                        <FaEdit />

                        Edit Class      <div 

                      </button>

                    )}        className="bg-white text-black p-8 rounded-lg shadow-2xl max-w-md w-full"}: ClassDetailsModalProps) {  isOpen: boolean;

                    {onDeleteClass && (

                      <button        style={{ 

                        onClick={() => {

                          if (confirm('Are you sure you want to delete this class? This action cannot be undone.')) {          backgroundColor: 'white',  console.log("🎭 Modal Debug:", { isOpen, hasClassData: !!classData, classDataTitle: classData?.title });  onClose: () => void;

                            onDeleteClass(classData.id!);

                            onClose();          color: 'black',

                          }

                        }}          padding: '2rem',  onAddParticipant: (classId: string) => void;

                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"

                      >          borderRadius: '8px',

                        <FaTrash />

                        Delete Class          maxWidth: '500px',  if (!isOpen) {  onRemoveParticipant: (classId: string) => void;

                      </button>

                    )}          width: '100%',

                    {onAddParticipant && (

                      <button          maxHeight: '80vh',    console.log("🚨 Not showing - isOpen is false");}

                        onClick={() => onAddParticipant(classData.id!)}

                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"          overflowY: 'auto'

                      >

                        <FaUserPlus />        }}    return null;

                        Add Participant

                      </button>        onClick={(e) => e.stopPropagation()}

                    )}

                    {onRemoveParticipant && currentParticipants > 0 && (      >  }// Helper function for location-based colors

                      <button

                        onClick={() => onRemoveParticipant(classData.id!)}        <div className="flex justify-between items-center mb-4">

                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"

                      >          <h2 className="text-2xl font-bold">Class Details</h2>const getLocationColorClass = (location: string) => {

                        <FaUserMinus />

                        Remove Participant          <button 

                      </button>

                    )}            onClick={onClose}  if (!classData) {  const locationLower = location.toLowerCase();

                  </>

                )}            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"

              </div>

            </div>          >    console.log("🚨 Not showing - no classData");  if (locationLower.includes('fl best trainer studio')) return 'text-blue-400';

          </motion.div>

        </div>            ✕

      )}

    </AnimatePresence>          </button>    return null;  if (locationLower.includes('bayfront park')) return 'text-green-400';

  );

}        </div>

          }  if (locationLower.includes('selby gardens')) return 'text-purple-400';

        <div className="space-y-3">

          <p><strong>Title:</strong> {classData.title}</p>  return 'text-slate-300';

          <p><strong>Type:</strong> {classData.class_type}</p>

          <p><strong>Date:</strong> {classData.date}</p>  console.log("✅ Rendering modal with data:", classData.title);};

          <p><strong>Time:</strong> {classData.start_time} - {classData.end_time}</p>

          <p><strong>Location:</strong> {classData.location}</p>

          <p><strong>Participants:</strong> {currentParticipants} / {classData.max_participants}</p>

          <p><strong>Price:</strong> ${pricePerSession.toFixed(2)}</p>  const currentParticipants = classData.current_participants || 0;export default function ClassDetailsModal({

          

          {classData.description && (  const pricePerSession = Number(classData.price_per_session) || 0;  classData,

            <div>

              <strong>Description:</strong>  isOpen,

              <p className="mt-1">{classData.description}</p>

            </div>  return (  onClose,

          )}

              <div   onAddParticipant,

          <div className="flex gap-2 mt-6">

            {classData.id && (      className="fixed inset-0 flex items-center justify-center p-4"  onRemoveParticipant,

              <>

                <button      style={{ }: ClassDetailsModalProps) {

                  onClick={() => onAddParticipant(classData.id!)}

                  disabled={currentParticipants >= classData.max_participants}        backgroundColor: 'rgba(0, 0, 0, 0.8)',   if (!isOpen) {

                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"

                >        zIndex: 99999,    return null;

                  Add Participant

                </button>        position: 'fixed',  }

                <button

                  onClick={() => onRemoveParticipant(classData.id!)}        top: 0,

                  disabled={currentParticipants <= 0}

                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:bg-gray-400"        left: 0,  if (!classData) {

                >

                  Remove Participant        right: 0,    return null;

                </button>

              </>        bottom: 0  }

            )}

          </div>      }}

        </div>

      </div>      onClick={(e) => {  const currentParticipants = classData.current_participants || 0;

    </div>

  );        if (e.target === e.currentTarget) {  const occupancyPercentage = (currentParticipants / classData.max_participants) * 100;

}
          onClose();  const availableSpots = classData.max_participants - currentParticipants;

        }  const pricePerSession = Number(classData.price_per_session) || 0;

      }}

    >  // Simple test modal to see if content renders

      <div   return (

        className="bg-white text-black p-8 rounded-lg shadow-2xl max-w-md w-full"    <div 

        style={{       className="fixed inset-0 flex items-center justify-center p-4"

          backgroundColor: 'white',      style={{ 

          color: 'black',        backgroundColor: 'rgba(0, 0, 0, 0.8)', 

          padding: '2rem',        zIndex: 99999,

          borderRadius: '8px',        position: 'fixed',

          maxWidth: '500px',        top: 0,

          width: '100%',        left: 0,

          maxHeight: '80vh',        right: 0,

          overflowY: 'auto'        bottom: 0

        }}      }}

        onClick={(e) => e.stopPropagation()}      onClick={(e) => {

      >        if (e.target === e.currentTarget) {

        <div className="flex justify-between items-center mb-4">          onClose();

          <h2 className="text-2xl font-bold">Class Details</h2>        }

          <button       }}

            onClick={onClose}    >

            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"      <div 

          >        className="bg-white text-black p-8 rounded-lg shadow-2xl max-w-md w-full"

            ✕        style={{ 

          </button>          backgroundColor: 'white',

        </div>          color: 'black',

                  padding: '2rem',

        <div className="space-y-3">          borderRadius: '8px',

          <p><strong>Title:</strong> {classData.title}</p>          maxWidth: '500px',

          <p><strong>Type:</strong> {classData.class_type}</p>          width: '100%',

          <p><strong>Date:</strong> {classData.date}</p>          maxHeight: '80vh',

          <p><strong>Time:</strong> {classData.start_time} - {classData.end_time}</p>          overflowY: 'auto'

          <p><strong>Location:</strong> {classData.location}</p>        }}

          <p><strong>Participants:</strong> {currentParticipants} / {classData.max_participants}</p>      >

          <p><strong>Price:</strong> ${pricePerSession.toFixed(2)}</p>        <div className="flex justify-between items-center mb-4">

                    <h2 className="text-2xl font-bold">Class Details</h2>

          {classData.description && (          <button 

            <div>            onClick={onClose}

              <strong>Description:</strong>            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"

              <p className="mt-1">{classData.description}</p>          >

            </div>            ✕

          )}          </button>

                  </div>

          <div className="flex gap-2 mt-6">        

            {classData.id && (        <div className="space-y-3">

              <>          <p><strong>Title:</strong> {classData.title}</p>

                <button          <p><strong>Type:</strong> {classData.class_type}</p>

                  onClick={() => onAddParticipant(classData.id!)}          <p><strong>Date:</strong> {classData.date}</p>

                  disabled={currentParticipants >= classData.max_participants}          <p><strong>Time:</strong> {classData.start_time} - {classData.end_time}</p>

                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"          <p><strong>Location:</strong> {classData.location}</p>

                >          <p><strong>Participants:</strong> {currentParticipants} / {classData.max_participants}</p>

                  Add Participant          <p><strong>Price:</strong> ${pricePerSession.toFixed(2)}</p>

                </button>          

                <button          {classData.description && (

                  onClick={() => onRemoveParticipant(classData.id!)}            <div>

                  disabled={currentParticipants <= 0}              <strong>Description:</strong>

                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:bg-gray-400"              <p className="mt-1">{classData.description}</p>

                >            </div>

                  Remove Participant          )}

                </button>          

              </>          <div className="flex gap-2 mt-6">

            )}            {classData.id && (

          </div>              <>

        </div>                <button

      </div>                  onClick={() => onAddParticipant(classData.id!)}

    </div>                  disabled={currentParticipants >= classData.max_participants}

  );                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"

}                >
                  Add Participant
                </button>
                <button
                  onClick={() => onRemoveParticipant(classData.id!)}
                  disabled={currentParticipants <= 0}
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:bg-gray-400"
                >
                  Remove Participant
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div>
                <h2 className="text-2xl font-bold text-white">{classData.title}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-slate-400">{classData.class_type}</span>
                  {classData.is_recurring && (
                    <span className="px-2 py-1 text-xs bg-purple-500 text-white rounded-full">
                      Recurring
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date & Time */}
                <div className="space-y-2">
                  <div className="flex items-center text-slate-400">
                    <FaCalendarAlt className="mr-2" />
                    <span className="font-medium">Date</span>
                  </div>
                  <div className="text-white">
                    <div className="font-medium">
                      {new Date(classData.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <div className="flex items-center text-slate-400">
                    <FaClock className="mr-2" />
                    <span className="font-medium">Time</span>
                  </div>
                  <div className="text-white font-medium">
                    {classData.start_time} - {classData.end_time}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <div className="flex items-center text-slate-400">
                    <FaMapMarkerAlt className="mr-2" />
                    <span className="font-medium">Location</span>
                  </div>
                  <div className={`font-medium ${getLocationColorClass(classData.location)}`}>
                    {classData.location}
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-center text-slate-400">
                    <FaDollarSign className="mr-2" />
                    <span className="font-medium">Price</span>
                  </div>
                  <div className="text-white font-medium">
                    ${pricePerSession.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Description */}
              {classData.description && (
                <div className="space-y-2">
                  <div className="flex items-center text-slate-400">
                    <FaInfo className="mr-2" />
                    <span className="font-medium">Description</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{classData.description}</p>
                </div>
              )}

              {/* Participants Section */}
              <div className="bg-slate-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-slate-400">
                    <FaUsers className="mr-2" />
                    <span className="font-medium">Participants</span>
                  </div>
                  <div className="text-white font-medium">
                    {currentParticipants} / {classData.max_participants} participants
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-700 rounded-full h-3 mb-4">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      occupancyPercentage >= 100
                        ? "bg-red-500"
                        : occupancyPercentage >= 75
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                  ></div>
                </div>

                {/* Participant Management */}
                {classData.id && (
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onAddParticipant(classData.id!)}
                        disabled={currentParticipants >= classData.max_participants}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaUserPlus />
                        <span>Add Participant</span>
                      </button>
                      <button
                        onClick={() => onRemoveParticipant(classData.id!)}
                        disabled={currentParticipants <= 0}
                        className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaUserMinus />
                        <span>Remove Participant</span>
                      </button>
                    </div>

                    {/* Status Messages */}
                    {currentParticipants >= classData.max_participants && (
                      <div className="flex items-center text-red-400 text-sm">
                        <FaExclamationTriangle className="mr-1" />
                        Class Full
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {classData.instructor && (
                  <div>
                    <span className="text-slate-400">Instructor:</span>
                    <span className="text-white ml-2">{classData.instructor}</span>
                  </div>
                )}
                {classData.difficulty_level && (
                  <div>
                    <span className="text-slate-400">Difficulty:</span>
                    <span className="text-white ml-2">{classData.difficulty_level}</span>
                  </div>
                )}
                {classData.equipment_needed && (
                  <div className="md:col-span-2">
                    <span className="text-slate-400">Equipment:</span>
                    <span className="text-white ml-2">{classData.equipment_needed}</span>
                  </div>
                )}
                {classData.prerequisites && (
                  <div className="md:col-span-2">
                    <span className="text-slate-400">Prerequisites:</span>
                    <span className="text-white ml-2">{classData.prerequisites}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-slate-700">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}