"use client";

import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import React, { useState, useEffect } from "react";
import PageTitle from "@/components/PageTitle";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {};

interface Setting {
  category: string;
  value: string | number | boolean;
  options?: string[];
  apiKeys?: { [key: string]: string };
}

const initialData: Setting[] = [
  {
    category: "Account",
    value: true
  },
  {
    category: "Notifications",
    value: false
  },
  {
    category: "Language",
    value: "English"
  },
  {
    category: "Theme",
    value: "Dark"
  },
  {
    category: "payment provider",
    value: "Stripe",
    options: ["Stripe", "Mollie", "PayPal", "Square"],
    apiKeys: {
      Stripe: "",
      Mollie: "",
      PayPal: "",
      Square: ""
    }
  }
];

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, apiKey, setApiKey }) => {
  const [isHidden, setIsHidden] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-5 rounded shadow-lg w-96">
        <h2 className="text-xl mb-4">API Key</h2>
        <div className="flex items-center mb-4">
          <input
            type={isHidden ? "password" : "text"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="border p-2 w-full"
          />
          <Button
            onClick={() => setIsHidden(!isHidden)}
            variant='secondary' className='rounded-full p-2 ml-2'
          >
            {isHidden ? <Eye className="inline-block" /> : <EyeOff className="inline-block" />}
          </Button>
        </div>
        <Button onClick={onClose} className="bg-black text-white p-2 w-full rounded">
          Close
        </Button>
      </div>
    </div>
  );
};

export default function SettingsPage({}: Props) {
  const [data, setData] = useState<Setting[]>(initialData);
  const [apiKey, setApiKey] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("");

  useEffect(() => {
    const storedData = initialData.map(setting => {
      if (setting.category === "payment provider" && setting.apiKeys) {
        return {
          ...setting,
          apiKeys: {
            Stripe: localStorage.getItem('Stripe') || "",
            Mollie: localStorage.getItem('Mollie') || "",
            PayPal: localStorage.getItem('PayPal') || "",
            Square: localStorage.getItem('Square') || ""
          }
        };
      }
      return setting;
    });
    setData(storedData);
  }, []);

  const handleSelectChange = (category: string, value: string) => {
    setData(prevData =>
      prevData.map(setting =>
        setting.category === category ? { ...setting, value } : setting
      )
    );
    if (category === "payment provider") {
      const selectedSetting = data.find(setting => setting.category === category);
      if (selectedSetting && selectedSetting.apiKeys) {
        setApiKey(selectedSetting.apiKeys[value] || "");
        setSelectedProvider(value);
      }
      setIsModalOpen(true);
    }
  };

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem(selectedProvider, newApiKey);
    setData(prevData =>
      prevData.map(setting =>
        setting.category === "payment provider" && setting.apiKeys
          ? { ...setting, apiKeys: { ...setting.apiKeys, [selectedProvider]: newApiKey } }
          : setting
      )
    );
  };

  const columns: ColumnDef<Setting>[] = [
    {
      accessorKey: "category",
      header: "Category"
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => {
        const setting = row.original;
        if (setting.category === "payment provider") {
          return (
            <div>
              <select
                value={setting.value as string}
                onChange={(e) => handleSelectChange(setting.category, e.target.value)}
                className="border p-2"
              >
                {setting.options?.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          );
        }
        if (setting.options) {
          return (
            <select
              value={setting.value as string}
              onChange={(e) => handleSelectChange(setting.category, e.target.value)}
              className="border p-2"
            >
              {setting.options.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        return setting.value.toString();
      }
    }
  ];

  return (
    <div className="flex flex-col gap-5 w-full">
      <PageTitle title="Settings" />
      <DataTable columns={columns} data={data} />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        apiKey={apiKey}
        setApiKey={handleApiKeyChange}
      />
    </div>
  );
}