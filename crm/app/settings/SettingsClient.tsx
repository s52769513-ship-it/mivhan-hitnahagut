"use client";

import { toggleKibbutz } from "./actions";

export default function SettingsClient({ hideKibbutz }: { hideKibbutz: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
      <h2 className="text-base font-semibold text-gray-800 mb-5">תצוגת בחורים</h2>
      <div className="flex items-center justify-between gap-6">
        <div>
          <p className="text-sm font-medium text-gray-800">הסתרת בחורי קיבוץ</p>
          <p className="text-xs text-gray-400 mt-1">
            {hideKibbutz
              ? "בחורי קיבוץ מוסתרים מכל רחבי המערכת"
              : "כל הבחורים מוצגים כולל בחורי קיבוץ"}
          </p>
        </div>
        <form action={toggleKibbutz}>
          <button
            type="submit"
            dir="ltr"
            className={`relative inline-flex h-7 w-14 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${
              hideKibbutz ? "bg-[#1e3a5f]" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                hideKibbutz ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </form>
      </div>
      <div className="mt-3 text-xs text-gray-400">
        סטטוס נוכחי:{" "}
        <span className={hideKibbutz ? "text-red-500 font-medium" : "text-green-600 font-medium"}>
          {hideKibbutz ? "מוסתר" : "מוצג"}
        </span>
      </div>
    </div>
  );
}
