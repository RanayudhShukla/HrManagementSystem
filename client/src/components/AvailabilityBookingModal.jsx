import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Video, User, CheckCircle2, AlertCircle, ArrowRight, Sparkles, ExternalLink } from 'lucide-react';

export default function AvailabilityBookingModal({
  isOpen,
  onClose,
  candidate, // Optional: candidate who just applied, or null if viewing generally
  onBookingSuccess,
}) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [error, setError] = useState('');

  // Fallback candidate identifier if opening from navbar without prior application
  const [manualCandidateId, setManualCandidateId] = useState('');
  const [candidatesList, setCandidatesList] = useState([]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const [slotRes, candRes] = await Promise.all([
        fetch('/api/availability'),
        fetch('/api/candidates'),
      ]);
      const slotData = await slotRes.json();
      const candData = await candRes.json();

      if (slotData.success) setSlots(slotData.data);
      if (candData.success) {
        setCandidatesList(candData.data);
        if (!candidate && candData.data.length > 0) {
          setManualCandidateId(candData.data[0].id);
        }
      }
    } catch (err) {
      setError('Could not load availability schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setBookingResult(null);
      setSelectedSlotId(null);
      setError('');
      fetchSlots();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Group slots by date
  const groupedSlots = slots.reduce((acc, slot) => {
    acc[slot.date] = acc[slot.date] || [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  const activeCandidate = candidate || candidatesList.find((c) => c.id === manualCandidateId);

  const handleConfirmBooking = async () => {
    if (!selectedSlotId) {
      setError('Please select an available interview slot first.');
      return;
    }
    if (!activeCandidate) {
      setError('Please select or specify which candidate is scheduling this interview.');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      const res = await fetch('/api/availability/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlotId,
          candidateId: activeCandidate.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBookingResult(data.data);
        fetchSlots();
        if (onBookingSuccess) onBookingSuccess(data.data);
      } else {
        setError(data.message || 'Failed to book slot.');
      }
    } catch (err) {
      setError('Network error while booking interview slot.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Recruiter & HR Availability Scheduler
            </h2>
            <p className="text-xs text-slate-400">
              Select an open slot from our interview panel's live calendar.
            </p>
          </div>
        </div>

        {/* Success Confirmation View */}
        {bookingResult ? (
          <div className="mt-6 p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-center space-y-4 animate-in fade-in">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-white">Interview Confirmed!</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Your meeting has been scheduled with <strong className="text-white">{bookingResult.slot.interviewerName}</strong>.
            </p>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left text-xs max-w-md mx-auto space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Date & Time:</span>
                <span className="font-semibold text-white">
                  {bookingResult.slot.date} at {bookingResult.slot.timeSlot}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Candidate:</span>
                <span className="font-semibold text-cyan-400">
                  {bookingResult.candidate.fullName} ({bookingResult.candidate.id})
                </span>
              </div>
              <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span>Meeting Link:</span>
                <a
                  href={bookingResult.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Video className="w-3.5 h-3.5" /> Google Meet
                </a>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-md shadow-cyan-500/20"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Candidate Context Pill */}
            {candidate ? (
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-indigo-300">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>
                    Booking interview for: <strong className="text-white">{candidate.fullName}</strong> ({candidate.jobTitle})
                  </span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400">ID: {candidate.id}</span>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>Candidate Profile:</span>
                </div>
                <select
                  value={manualCandidateId}
                  onChange={(e) => setManualCandidateId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-400"
                >
                  {candidatesList.map((cand) => (
                    <option key={cand.id} value={cand.id}>
                      {cand.fullName} — {cand.jobTitle} ({cand.id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Availability Slots Grid Grouped by Date */}
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Loading available interviewer slots...
              </div>
            ) : Object.keys(groupedSlots).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No recruiter availability slots currently configured.
              </div>
            ) : (
              <div className="space-y-5 max-h-[340px] overflow-y-auto pr-1">
                {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                  <div key={date} className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {dateSlots.map((slot) => {
                        const isSelected = selectedSlotId === slot.id;
                        return (
                          <div
                            key={slot.id}
                            onClick={() => !slot.isBooked && setSelectedSlotId(slot.id)}
                            className={`p-3.5 rounded-xl border text-xs transition-all ${
                              slot.isBooked
                                ? 'bg-slate-950/40 border-slate-800/60 opacity-60 cursor-not-allowed'
                                : isSelected
                                ? 'bg-cyan-500/10 border-cyan-400 shadow-md shadow-cyan-500/10 cursor-pointer'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-semibold text-white flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                                {slot.timeSlot}
                              </span>

                              {slot.isBooked ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                                  Booked
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Available
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-400 truncate">
                              Interviewer: <strong className="text-slate-300">{slot.interviewerName}</strong>
                            </p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              Round: {slot.interviewerRole}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {selectedSlotId ? 'Slot selected. Ready to book.' : 'Click on any available green slot above.'}
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmBooking}
                  disabled={!selectedSlotId || bookingLoading}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{bookingLoading ? 'Confirming...' : 'Confirm Interview Slot'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
