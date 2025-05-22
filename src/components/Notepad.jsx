import { useEffect, useState, useRef } from "react";
import { jsPDF } from "jspdf";
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiSave,
  FiX,
  FiDownload,
  FiFileText,
  FiPrinter,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const AUTO_TITLE_PREFIX = "Note";

const Notepad = () => {
  const [noteKeys, setNoteKeys] = useState(() => {
    const storedKeys = JSON.parse(localStorage.getItem("noteKeys"));
    return storedKeys || [`${AUTO_TITLE_PREFIX} 1`];
  });

  const [selectedKey, setSelectedKey] = useState(noteKeys[0]);
  const [note, setNote] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [manualTitles, setManualTitles] = useState(() => {
    return JSON.parse(localStorage.getItem("manualTitles")) || {};
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const renameInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // Save dark mode preference to localStorage and toggle html class
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Animate page flip when changing notes
  useEffect(() => {
    setIsFlipping(true);
    const timeout = setTimeout(() => setIsFlipping(false), 600);
    return () => clearTimeout(timeout);
  }, [selectedKey]);

  // Load note content when selectedKey changes
  useEffect(() => {
    const saved = localStorage.getItem(selectedKey);
    setNote(saved || "");
  }, [selectedKey]);

  // Save note content & auto rename if no manual title
  useEffect(() => {
    localStorage.setItem(selectedKey, note);
  }, [note]);

  useEffect(() => {
    localStorage.setItem("noteKeys", JSON.stringify(noteKeys));
  }, [noteKeys]);

  useEffect(() => {
    localStorage.setItem("manualTitles", JSON.stringify(manualTitles));
  }, [manualTitles]);

  function generateTitle(text) {
    if (!text.trim()) return "";
    const firstLine = text.trim().split("\n")[0];
    return firstLine.length > 30 ? firstLine.slice(0, 27) + "..." : firstLine;
  }

  const handleGenerateQR = async () => {
    try {
      const QRCode = await import("qrcode");
      const data = `${selectedKey} - ${note}`;
      const url = await QRCode.toDataURL(data);
      setQrDataUrl(url);
      setShowQrModal(true);
    } catch (err) {
      toast.error("Failed to generate QR code.");
      console.error(err);
    }
  };

  const handleShareViaWhatsApp = async () => {
    try {
      const QRCode = await import("qrcode");
      const data = `${selectedKey} - ${note}`;
      const url = await QRCode.toDataURL(data);
      setQrDataUrl(url); // optional, in case you want to show it as well

      // Upload to anonymous image hosting or use data URL directly
      const whatsappMessage = encodeURIComponent(
        `Here's a QR code for my note "${selectedKey}":\n\n(Note preview: ${note.slice(
          0,
          100
        )}...)`
      );

      // Use data URL directly via WhatsApp (some clients support it), or recommend downloading it
      const shareUrl = `https://api.whatsapp.com/send?text=${whatsappMessage}`;

      window.open(shareUrl, "_blank");
    } catch (err) {
      toast.error("Failed to share via WhatsApp.");
      console.error(err);
    }
  };

  const addNewNote = () => {
    let i = 1;
    let newNoteName;
    do {
      newNoteName = `${AUTO_TITLE_PREFIX} ${i++}`;
    } while (noteKeys.includes(newNoteName));

    const firstLine = generateTitle("");
    localStorage.setItem(newNoteName, "");

    setManualTitles((prev) => ({
      ...prev,
      [newNoteName]: false, // mark as not manually titled
    }));

    setNoteKeys((prev) => [...prev, newNoteName]);
    setSelectedKey(newNoteName);
  };

  const renameNote = () => {
    const trimmed = renameValue.trim();
    if (!trimmed) return toast.error("Name cannot be empty.");
    if (noteKeys.includes(trimmed) && trimmed !== selectedKey)
      return toast.error("Name already exists.");

    const updatedKeys = noteKeys.map((key) =>
      key === selectedKey ? trimmed : key
    );
    const content = localStorage.getItem(selectedKey);
    localStorage.removeItem(selectedKey);
    localStorage.setItem(trimmed, content);

    setManualTitles((prev) => ({
      ...prev,
      [trimmed]: true,
      [selectedKey]: undefined,
    }));

    setNoteKeys(updatedKeys);
    setSelectedKey(trimmed);
    setIsRenaming(false);
    setRenameValue("");
  };

  const deleteNoteConfirmed = () => {
    if (noteKeys.length === 1)
      return toast.error("You can't delete the only note.");
    const newKeys = noteKeys.filter((k) => k !== selectedKey);
    localStorage.removeItem(selectedKey);

    setManualTitles((prev) => {
      const copy = { ...prev };
      delete copy[selectedKey];
      return copy;
    });

    setNoteKeys(newKeys);
    setSelectedKey(newKeys[0]);
    setShowDeleteModal(false);
    toast.success("Note deleted.");
  };

  const downloadAsTxt = () => {
    const blob = new Blob([note], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedKey}.txt`;
    a.click();
  };
  const handlePrint = () => {
    const printContents = document.getElementById("print-area").innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Refresh to restore React state
  };

  const downloadAsPDF = () => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(note, 180);
    doc.text(lines, 10, 10);
    doc.save(`${selectedKey}.pdf`);
  };

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  return (
    <div
      className="min-h-screen p-6 max-w-4xl mx-auto font-serif
      bg-paperLight dark:bg-paperDark
      text-paperTextLight dark:text-paperTextDark
      transition-colors duration-500"
    >
      <header className="text-center py-4 border-b border-b-paperBorderLight dark:border-b-paperBorderDark mb-6 select-none">
        <h1 className="text-3xl font-bold text-terraLight dark:text-terraDark tracking-wide flex items-center justify-center gap-2">
          <img
            src="/ChatGPT Image May 19, 2025, 09_41_17 PM.png"
            alt="Home Icon"
            className="w-8 h-8"
            // Adjust width/height or styling as you want
          />
          Notify
        </h1>
        <p className="text-sm text-accentLight dark:text-accentDark">
          Warm notes for warmer thoughts
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
          className="p-2 border border-paperBorderLight dark:border-paperBorderDark rounded bg-paperInputLight dark:bg-paperInputDark text-paperTextLight dark:text-paperTextDark"
        >
          {noteKeys.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>

        <button
          onClick={addNewNote}
          className="button-action bg-terraLight hover:bg-terraHoverLight dark:bg-terraDark dark:hover:bg-terraHoverDark"
          title="Add new note"
        >
          <FiPlus /> New
        </button>

        <button
          onClick={() => {
            setRenameValue(selectedKey);
            setIsRenaming(true);
          }}
          className="button-action bg-terraLight hover:bg-terraHoverLight dark:bg-terraDark dark:hover:bg-terraHoverDark"
          title="Rename note"
        >
          <FiEdit2 /> Rename
        </button>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="button-action bg-terraLight hover:bg-terraHoverLight dark:bg-terraDark dark:hover:bg-terraHoverDark"
          title="Delete note"
        >
          <FiTrash2 /> Delete
        </button>
      </div>

      {isRenaming && (
        <div className="mb-4 flex gap-2 animate-fadeIn">
          <input
            ref={renameInputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") renameNote();
            }}
            className="flex-1 p-2 border border-paperBorderLight dark:border-paperBorderDark rounded bg-paperInputLight dark:bg-paperInputDark text-paperTextLight dark:text-paperTextDark"
          />
          <button
            onClick={renameNote}
            className="button-action bg-terraLight hover:bg-terraHoverLight dark:bg-terraDark dark:hover:bg-terraHoverDark"
          >
            <FiSave /> Save
          </button>
          <button
            onClick={() => {
              setIsRenaming(false);
              setRenameValue("");
            }}
            className="button-action bg-terraLight hover:bg-terraHoverLight dark:bg-terraDark dark:hover:bg-terraHoverDark"
          >
            <FiX /> Cancel
          </button>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={15}
        className={`w-full p-3 border border-paperBorderLight dark:border-paperBorderDark rounded bg-paperInputLight dark:bg-paperInputDark text-paperTextLight dark:text-paperTextDark resize-none shadow-inner
          transition-colors duration-500
          ${isFlipping ? "animate-pageFlip" : ""}
        `}
        placeholder={`Start writing in ${selectedKey}...`}
        spellCheck={false}
      />

      <div className="flex gap-2 mt-4 flex-wrap">
        <button
          onClick={downloadAsTxt}
          className="button-action bg-terraLight hover:bg-terraHoverLight dark:bg-terraDark dark:hover:bg-terraHoverDark"
        >
          <FiFileText /> Download .txt
        </button>
        <button
          onClick={downloadAsPDF}
          className="button-action bg-terraLight hover:bg-terraHoverLight dark:bg-terraDark dark:hover:bg-terraHoverDark"
        >
          <FiDownload /> Export to PDF
        </button>
        <button
          onClick={handlePrint}
          className="button-action bg-terraLight hover:bg-terraHoverLight dark:bg-terraDark dark:hover:bg-terraHoverDark"
        >
          <FiPrinter /> Print Note
        </button>

        <button
          onClick={handleGenerateQR}
          className="button-action bg-terraLight hover:bg-terraHoverLight dark:bg-terraDark dark:hover:bg-terraHoverDark"
        >
          Share via QR
        </button>

        <button
          onClick={handleShareViaWhatsApp}
          className="button-action bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
        >
          Share on WhatsApp
        </button>

        <div id="print-area" className="hidden">
          <h1>{selectedKey}</h1>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "serif" }}>
            {note}
          </pre>
        </div>

        <div className="text-center text-[27px] text-accentLight dark:text-accentDark select-none">
          <Link
            to="/privacy"
            className="hover:underline hover:text-terraLight dark:hover:text-terraDark transition-colors duration-300"
          >
            Privacy Policy
          </Link>
        </div>
      </div>

      {/* <div className="my-4 p-4 text-center bg-paperInputLight dark:bg-paperInputDark border border-paperBorderLight dark:border-paperBorderDark rounded text-accentLight dark:text-accentDark select-none">
        // SHOW ADS HERE MAYBE
      </div> */}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-paperInputLight dark:bg-paperInputDark p-6 rounded-lg shadow-lg text-center border border-paperBorderLight dark:border-paperBorderDark text-paperTextLight dark:text-paperTextDark">
            <h2 className="text-xl font-semibold mb-4 text-red-500">
              Delete Note
            </h2>
            <p className="mb-4 text-sm">
              Are you sure you want to delete <strong>"{selectedKey}"</strong>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={deleteNoteConfirmed}
                className="button-action bg-terraLight hover:bg-terraHoverLight dark:bg-terraDark dark:hover:bg-terraHoverDark"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="button-action bg-terraLight hover:bg-terraHoverLight dark:bg-terraDark dark:hover:bg-terraHoverDark"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showQrModal && qrDataUrl && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-white dark:bg-paperInputDark text-black dark:text-paperTextDark p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-semibold mb-4">Scan to Share</h2>
            <img src={qrDataUrl} alt="QR Code" className="mx-auto mb-4 " />
            <button
              onClick={() => setShowQrModal(false)}
              className="button-action bg-terraLight hover:bg-terraHoverLight dark:bg-terraDark dark:hover:bg-terraHoverDark"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        /* Button base */
        .button-action {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          color: white;
          font-weight: 600;
          border-radius: 0.375rem;
          border: none;
          box-shadow: 0 2px 5px rgb(0 0 0 / 0.15);
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        /* Colors for light/dark mode */
        .bg-paperLight {
          background-color: #fdf7f0;
          background-image: url("data:image/svg+xml,%3csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M10 0L12.36 6.18L19 7.27L14 11.97L15.45 18.63L10 15.77L4.55 18.63L6 11.97L1 7.27L7.64 6.18L10 0Z' fill='%23f5e9dd' fill-opacity='0.1'/%3e%3c/svg%3e");
        }
        .bg-paperDark {
          background-color: #2e2a24;
          background-image: url("data:image/svg+xml,%3csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M10 0L12.36 6.18L19 7.27L14 11.97L15.45 18.63L10 15.77L4.55 18.63L6 11.97L1 7.27L7.64 6.18L10 0Z' fill='%23666666' fill-opacity='0.1'/%3e%3c/svg%3e");
        }

        .text-paperTextLight {
          color: #3b2f2f;
        }
        .text-paperTextDark {
          color: #cfc9c1;
        }

        .border-paperBorderLight {
          border-color: #e0cfc2;
        }
        .border-paperBorderDark {
          border-color: #5a534c;
        }

        .bg-paperInputLight {
          background-color: #fff9f4;
        }
        .bg-paperInputDark {
          background-color: #4c443c;
        }

        .text-accentLight {
          color: #8c6e63;
        }
        .text-accentDark {
          color: #bfa58f;
        }

        .bg-terraLight {
          background-color: #d77a61;
        }
        .hover\\:bg-terraHoverLight:hover {
          background-color: #c45f47;
        }
        .bg-terraDark {
          background-color: #ab5a3e;
        }
        .hover\\:bg-terraHoverDark:hover {
          background-color: #8c472f;
        }

        /* Animation for page flip */
        @keyframes pageFlip {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(90deg);
            opacity: 0;
          }
          51% {
            opacity: 0;
          }
          100% {
            transform: rotateY(0deg);
            opacity: 1;
          }
        }
        .animate-pageFlip {
          animation: pageFlip 0.6s ease forwards;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          perspective: 1000px;
        }

        /* Fade in for rename input */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out forwards;
        }
          @media print {
          body * {
          visibility: hidden;
        }

        #print-area,
        #print-area * {
          visibility: visible;
        }

        #print-area {
          position: absolute;
         top: 0;
         left: 0;
         background: white;
         color: black;
          width: 100%;
         padding: 20px;
       }
      }
      `}</style>
    </div>
  );
};

export default Notepad;
