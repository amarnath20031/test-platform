"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase/client";

export default function ImportStudentsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<any>(null);

  function handleFile(file: File) {
    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (e) => {
      const workbook = XLSX.read(
        e.target?.result,
        {
          type: "binary",
        }
      );

      const sheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      const json =
        XLSX.utils.sheet_to_json(sheet);

      setRows(json as any[]);
    };

    reader.readAsBinaryString(file);
  }

  async function importStudents() {
    if (rows.length === 0) {
      alert("Upload an Excel file first.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Login expired.");
        return;
      }

      const { data: profile } =
        await supabase
          .from("profile")
          .select("instituteId")
          .eq("id", user.id)
          .single();

      if (!profile?.instituteId) {
        alert("Institute not found.");
        return;
      }

      const response = await fetch(
        "/api/students/import",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            students: rows,
            instituteId:
              profile.instituteId,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }

      setResult(data);
      setRows([]);
      setFileName("");

    } catch (err) {
      console.error(err);
      alert("Import failed.");
    }

    setLoading(false);
  }
    return (
    <div className="max-w-7xl mx-auto p-10">

      <h1 className="text-4xl font-bold text-white mb-8">
        📥 Import Students
      </h1>

      <div className="rounded-3xl bg-slate-900 border border-slate-700 p-8">

        <label
          className="
            h-72
            rounded-3xl
            border-2
            border-dashed
            border-slate-600
            flex
            flex-col
            items-center
            justify-center
            cursor-pointer
            hover:border-blue-500
            transition
          "
        >

          <div className="text-7xl">
            📄
          </div>

          <h2 className="text-2xl font-bold text-white mt-6">
            Upload Students Excel
          </h2>

          <p className="text-slate-400 mt-2">
            .xlsx or .xls
          </p>

          <input
            hidden
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              if (
                e.target.files &&
                e.target.files.length > 0
              ) {
                handleFile(e.target.files[0]);
              }
            }}
          />

        </label>

        {fileName && (
          <div className="mt-6 text-green-400 font-semibold">
            Uploaded: {fileName}
          </div>
        )}

      </div>

      {rows.length > 0 && (

        <div className="mt-10">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-3xl font-bold text-white">
              Preview
              <span className="text-blue-400 ml-2">
                ({rows.length})
              </span>
            </h2>

            <button
              onClick={importStudents}
              disabled={loading}
              className="
                bg-blue-600
                hover:bg-blue-700
                disabled:bg-gray-600
                px-8
                py-4
                rounded-2xl
                text-white
                font-bold
                text-lg
              "
            >
              {loading
                ? "Importing..."
                : "Import Students"}
            </button>

          </div>

          <div className="overflow-auto rounded-2xl border border-slate-700">

            <table className="w-full">

              <thead className="bg-slate-800">

                <tr>

                  {Object.keys(rows[0]).map((key) => (

                    <th
                      key={key}
                      className="text-left p-4 text-white"
                    >
                      {key}
                    </th>

                  ))}

                </tr>

              </thead>

              <tbody>

                {rows.map((row: any, index: number) => (

                  <tr
                    key={index}
                    className="border-t border-slate-700"
                  >

                    {Object.values(row).map((value: any, i) => (

                      <td
                        key={i}
                        className="p-4 text-slate-300"
                      >
                        {String(value)}
                      </td>

                    ))}

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}
            {result && (

        <div className="mt-10 rounded-3xl border border-green-700 bg-green-950 p-8">

          <h2 className="text-3xl font-bold text-green-300 mb-8">
            ✅ Import Complete
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">

            <div className="rounded-2xl bg-slate-900 p-6">

              <p className="text-gray-400">
                Students Imported
              </p>

              <p className="text-5xl font-bold text-green-400 mt-2">
                {result.imported}
              </p>

            </div>

            <div className="rounded-2xl bg-slate-900 p-6">

              <p className="text-gray-400">
                Failed
              </p>

              <p className="text-5xl font-bold text-red-400 mt-2">
                {result.failed}
              </p>

            </div>

          </div>

          {result.accounts?.length > 0 && (

            <>

              <h3 className="text-2xl font-bold text-white mb-5">
                🔑 Generated Login Credentials
              </h3>

              <div className="overflow-auto rounded-2xl border border-slate-700">

                <table className="w-full">

                  <thead className="bg-slate-800">

                    <tr>

                      <th className="text-left p-4 text-white">
                        Student
                      </th>

                      <th className="text-left p-4 text-white">
                        Email
                      </th>

                      <th className="text-left p-4 text-white">
                        Temporary Password
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {result.accounts.map(
                      (
                        student: any,
                        index: number
                      ) => (

                        <tr
                          key={index}
                          className="border-t border-slate-700"
                        >

                          <td className="p-4 text-white">
                            {student.name}
                          </td>

                          <td className="p-4 text-slate-300">
                            {student.email}
                          </td>

                          <td className="p-4 font-bold text-green-400">
                            {student.password}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </>

          )}

          {result.errors?.length > 0 && (

            <>

              <h3 className="text-2xl font-bold text-red-400 mt-10 mb-5">
                ❌ Failed Imports
              </h3>

              <div className="rounded-2xl border border-red-800 overflow-hidden">

                <table className="w-full">

                  <thead className="bg-red-950">

                    <tr>

                      <th className="text-left p-4 text-white">
                        Email
                      </th>

                      <th className="text-left p-4 text-white">
                        Reason
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {result.errors.map(
                      (
                        error: any,
                        index: number
                      ) => (

                        <tr
                          key={index}
                          className="border-t border-red-800"
                        >

                          <td className="p-4 text-white">
                            {error.email}
                          </td>

                          <td className="p-4 text-red-300">
                            {error.reason}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </>

          )}

        </div>

      )}
          </div>
  );
}