import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div
      className="min-h-screen p-6 max-w-3xl mx-auto font-serif
      bg-paperLight dark:bg-paperDark
      text-paperTextLight dark:text-paperTextDark
      transition-colors duration-500"
    >
      <header className="text-center py-4 border-b border-b-paperBorderLight dark:border-b-paperBorderDark mb-6 select-none">
        <h1 className="text-3xl font-bold text-terraLight dark:text-terraDark tracking-wide">
          Privacy Policy
        </h1>
        <p className="text-sm text-accentLight dark:text-accentDark">
          How your data is (not) handled
        </p>
      </header>

      <section className="text-lg leading-relaxed">
        <p className="mb-4">
          <strong>Notify Notepad</strong> does not collect or store any user data. All notes you create remain in your browser and are never uploaded or shared.
        </p>
        <p className="mb-4">
          All features — creating notes, renaming, deleting, exporting to PDF or TXT — work entirely offline using your local device.
        </p>
        <p className="mb-4">
          There are no cookies, tracking scripts, or third-party analytics tools. Your privacy is fully respected and preserved.
        </p>
        <p className="mb-4">
          If you download your notes, they are saved only to your own device. We do not and cannot access these files.
        </p>
        <p className="mb-8">
          This app is built for simplicity and privacy-first usage — with no account system, no data syncing, and no external storage.
        </p>
        <div className="text-center">
          <Link to="/" className="text-terraLight hover:underline dark:text-terraDark">
            ← Back to Notify
          </Link>
        </div>
      </section>

      <style>{`
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

        .text-accentLight {
          color: #8c6e63;
        }
        .text-accentDark {
          color: #bfa58f;
        }

        .text-terraLight {
          color: #d77a61;
        }
        .text-terraDark {
          color: #ab5a3e;
        }
      `}</style>
    </div>
  );
}
