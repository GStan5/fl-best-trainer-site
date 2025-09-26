import React from 'react';export default function ClassDetailsModal({ classData, isOpen, onClose, onAddParticipant, onRemoveParticipant }) {import React from "react";import React from "react";import { motion, AnimatePresence } from "framer-motion";



interface Class {  if (!isOpen || !classData) return null;

  id?: string;

  title: string;

  description: string;

  instructor: string;  const currentParticipants = classData.current_participants || 0;

  date: string;

  start_time: string;  const pricePerSession = Number(classData.price_per_session) || 0;interface Class {import {

  end_time: string;

  max_participants: number;

  current_participants?: number;

  location: string;  return (  id?: string;

  class_type: string;

  difficulty_level?: string;    <div 

  equipment_needed?: string;

  prerequisites?: string;      style={{   title: string;interface Class {  FaTimes,

  price_per_session?: number;

  is_active?: boolean;        position: 'fixed',

  is_recurring?: boolean;

  recurring_days?: string[];        top: 0,  description: string;

}

        left: 0,

interface ClassDetailsModalProps {

  isOpen: boolean;        right: 0,  instructor: string;  id?: string;  FaUsers,

  onClose: () => void;

  classData: Class | null;        bottom: 0,

}

        backgroundColor: 'rgba(0, 0, 0, 0.8)',  date: string;

export default function ClassDetailsModal({ classData, isOpen, onClose }: ClassDetailsModalProps) {

  if (!isOpen || !classData) return null;        zIndex: 99999,



  const currentParticipants = classData.current_participants || 0;        display: 'flex',  start_time: string;  title: string;  FaCalendarAlt,

  const pricePerSession = Number(classData.price_per_session) || 0;

        alignItems: 'center',

  return (

    <div         justifyContent: 'center',  end_time: string;

      style={{ 

        position: 'fixed',        padding: '1rem'

        top: 0,

        left: 0,      }}  max_participants: number;  description: string;  FaClock,

        right: 0,

        bottom: 0,      onClick={(e) => {

        backgroundColor: 'rgba(0, 0, 0, 0.8)',

        zIndex: 99999,        if (e.target === e.currentTarget) {  current_participants?: number;

        display: 'flex',

        alignItems: 'center',          onClose();

        justifyContent: 'center',

        padding: '1rem'        }  location: string;  instructor: string;  FaMapMarkerAlt,

      }}

      onClick={(e) => {      }}

        if (e.target === e.currentTarget) {

          onClose();    >  class_type: string;

        }

      }}      <div 

    >

      <div         style={{   difficulty_level?: string;  date: string;  FaDollarSign,

        style={{ 

          backgroundColor: 'white',          backgroundColor: 'white',

          color: 'black',

          padding: '2rem',          color: 'black',  equipment_needed?: string;

          borderRadius: '8px',

          maxWidth: '500px',          padding: '2rem',

          width: '100%',

          maxHeight: '80vh',          borderRadius: '8px',  prerequisites?: string;  start_time: string;  FaUserPlus,

          overflowY: 'auto'

        }}          maxWidth: '500px',

        onClick={(e) => e.stopPropagation()}

      >          width: '100%',  price_per_session?: number;

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Class Details</h2>          maxHeight: '80vh',

          <button 

            onClick={onClose}          overflowY: 'auto'  is_active?: boolean;  end_time: string;  FaUserMinus,

            style={{ 

              backgroundColor: '#ef4444',        }}

              color: 'white',

              padding: '0.5rem 1rem',        onClick={(e) => e.stopPropagation()}  is_recurring?: boolean;

              border: 'none',

              borderRadius: '4px',      >

              cursor: 'pointer',

              fontSize: '0.875rem'        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>  recurring_days?: string[];  max_participants: number;  FaInfo,

            }}

          >          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Class Details</h2>

            ✕

          </button>          <button }

        </div>

            onClick={onClose}

        <div style={{ display: 'grid', gap: '1rem' }}>

          <div>            style={{   current_participants?: number;  FaExclamationTriangle,

            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>

              {classData.title}              backgroundColor: '#ef4444',

            </h3>

            <p style={{ color: '#666', marginBottom: '1rem' }}>              color: 'white',interface ClassDetailsModalProps {

              {classData.description}

            </p>              padding: '0.5rem 1rem',

          </div>

              border: 'none',  classData: Class | null;  location: string;} from "react-icons/fa";

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

            <div>              borderRadius: '4px',

              <strong>Instructor:</strong> {classData.instructor}

            </div>              cursor: 'pointer'  isOpen: boolean;

            <div>

              <strong>Location:</strong> {classData.location}            }}

            </div>

            <div>          >  onClose: () => void;  class_type: string;

              <strong>Date:</strong> {classData.date}

            </div>            ✕

            <div>

              <strong>Time:</strong> {classData.start_time} - {classData.end_time}          </button>  onAddParticipant: (classId: string) => void;

            </div>

            <div>        </div>

              <strong>Class Type:</strong> {classData.class_type}

            </div>          onRemoveParticipant: (classId: string) => void;  difficulty_level?: string;interface Class {

            <div>

              <strong>Difficulty:</strong> {classData.difficulty_level || 'Not specified'}        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            </div>

          </div>          <p><strong>Title:</strong> {classData.title}</p>}



          <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '1rem' }}>          <p><strong>Type:</strong> {classData.class_type}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

              <div>          <p><strong>Date:</strong> {classData.date}</p>  equipment_needed?: string;  id?: string;

                <strong>Participants:</strong> {currentParticipants} / {classData.max_participants}

              </div>          <p><strong>Time:</strong> {classData.start_time} - {classData.end_time}</p>

              <div>

                <strong>Price:</strong> ${pricePerSession.toFixed(2)}          <p><strong>Location:</strong> {classData.location}</p>export default function ClassDetailsModal({

              </div>

            </div>          <p><strong>Participants:</strong> {currentParticipants} / {classData.max_participants}</p>



            {classData.equipment_needed && (          <p><strong>Price:</strong> ${pricePerSession.toFixed(2)}</p>  classData,  prerequisites?: string;  title: string;

              <div style={{ marginBottom: '1rem' }}>

                <strong>Equipment Needed:</strong> {classData.equipment_needed}          

              </div>

            )}          {classData.description && (  isOpen,



            {classData.prerequisites && (            <div>

              <div style={{ marginBottom: '1rem' }}>

                <strong>Prerequisites:</strong> {classData.prerequisites}              <strong>Description:</strong>  onClose,  price_per_session?: number;  description: string;

              </div>

            )}              <p style={{ marginTop: '0.25rem' }}>{classData.description}</p>



            {classData.is_recurring && classData.recurring_days && (            </div>  onAddParticipant,

              <div>

                <strong>Recurring Days:</strong> {classData.recurring_days.join(', ')}          )}

              </div>

            )}            onRemoveParticipant,  is_active?: boolean;  instructor: string;

          </div>

        </div>          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>

      </div>

    </div>            {classData.id && (}: ClassDetailsModalProps) {

  );

}              <>

                <button  console.log("🎭 Modal Debug:", { isOpen, hasClassData: !!classData, classDataTitle: classData?.title });  is_recurring?: boolean;  date: string;

                  onClick={() => onAddParticipant(classData.id)}

                  disabled={currentParticipants >= classData.max_participants}

                  style={{ 

                    backgroundColor: currentParticipants >= classData.max_participants ? '#9ca3af' : '#10b981',  if (!isOpen) {  recurring_days?: string[];  start_time: string;

                    color: 'white',

                    padding: '0.5rem 1rem',    console.log("🚨 Not showing - isOpen is false");

                    border: 'none',

                    borderRadius: '4px',    return null;}  end_time: string;

                    cursor: currentParticipants >= classData.max_participants ? 'not-allowed' : 'pointer'

                  }}  }

                >

                  Add Participant  max_participants: number;

                </button>

                <button  if (!classData) {

                  onClick={() => onRemoveParticipant(classData.id)}

                  disabled={currentParticipants <= 0}    console.log("🚨 Not showing - no classData");interface ClassDetailsModalProps {  current_participants?: number;

                  style={{ 

                    backgroundColor: currentParticipants <= 0 ? '#9ca3af' : '#f97316',    return null;

                    color: 'white',

                    padding: '0.5rem 1rem',  }  classData: Class | null;  location: string;

                    border: 'none',

                    borderRadius: '4px',

                    cursor: currentParticipants <= 0 ? 'not-allowed' : 'pointer'

                  }}  console.log("✅ Rendering modal with data:", classData.title);  isOpen: boolean;  class_type: string;

                >

                  Remove Participant

                </button>

              </>  const currentParticipants = classData.current_participants || 0;  onClose: () => void;  difficulty_level?: string;

            )}

          </div>  const pricePerSession = Number(classData.price_per_session) || 0;

        </div>

      </div>  onAddParticipant: (classId: string) => void;  equipment_needed?: string;

    </div>

  );  return (

}
    <div   onRemoveParticipant: (classId: string) => void;  prerequisites?: string;

      className="fixed inset-0 flex items-center justify-center p-4"

      style={{ }  price_per_session?: number;

        backgroundColor: 'rgba(0, 0, 0, 0.8)', 

        zIndex: 99999,  is_active?: boolean;

        position: 'fixed',

        top: 0,export default function ClassDetailsModal({  is_recurring?: boolean;

        left: 0,

        right: 0,  classData,  recurring_days?: string[];

        bottom: 0

      }}  isOpen,}

      onClick={(e) => {

        if (e.target === e.currentTarget) {  onClose,

          onClose();

        }  onAddParticipant,interface ClassDetailsModalProps {

      }}

    >  onRemoveParticipant,  classData: Class | null;

      <div 

        className="bg-white text-black p-8 rounded-lg shadow-2xl max-w-md w-full"}: ClassDetailsModalProps) {  isOpen: boolean;

        style={{ 

          backgroundColor: 'white',  console.log("🎭 Modal Debug:", { isOpen, hasClassData: !!classData, classDataTitle: classData?.title });  onClose: () => void;

          color: 'black',

          padding: '2rem',  onAddParticipant: (classId: string) => void;

          borderRadius: '8px',

          maxWidth: '500px',  if (!isOpen) {  onRemoveParticipant: (classId: string) => void;

          width: '100%',

          maxHeight: '80vh',    console.log("🚨 Not showing - isOpen is false");}

          overflowY: 'auto'

        }}    return null;

        onClick={(e) => e.stopPropagation()}

      >  }// Helper function for location-based colors

        <div className="flex justify-between items-center mb-4">

          <h2 className="text-2xl font-bold">Class Details</h2>const getLocationColorClass = (location: string) => {

          <button 

            onClick={onClose}  if (!classData) {  const locationLower = location.toLowerCase();

            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"

          >    console.log("🚨 Not showing - no classData");  if (locationLower.includes('fl best trainer studio')) return 'text-blue-400';

            ✕

          </button>    return null;  if (locationLower.includes('bayfront park')) return 'text-green-400';

        </div>

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