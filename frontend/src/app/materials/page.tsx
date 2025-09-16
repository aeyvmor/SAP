import { Card } from "@/components/Card";

const materials = [
    {
        id: "A17_CHIP",
        description: "A17 Pro Bionic Chip",
        type: "RAW",
        stock: 69420,
        price: 130,
        status: "Available",
    },
    {
        id: "OLED_PANEL",
        description: "6.7-inch OLED Display Panel",
        type: "COMPONENT",
        stock: 12000,
        price: 85,
        status: "Available",
    },
    {
        id: "BATTERY_5000MAH",
        description: "5000mAh Lithium Battery",
        type: "RAW",
        stock: 8000,
        price: 25,
        status: "Low Stock",
    },
    {
        id: "ALUM_FRAME",
        description: "Aluminum Frame",
        type: "RAW",
        stock: 15000,
        price: 10,
        status: "Available",
    },
    {
        id: "CAMERA_MODULE",
        description: "48MP Camera Module",
        type: "COMPONENT",
        stock: 5000,
        price: 60,
        status: "Out of Stock",
    },
    {
        id: "USB_C_PORT",
        description: "USB-C Charging Port",
        type: "COMPONENT",
        stock: 20000,
        price: 5,
        status: "Available",
    },
];

export default function Home() {
    return (
        <div className="flex flex-1 flex-col gap-10 max-w-7xl">
            <p className="text-xl mr-auto">Material Management</p>
            <Card>
                <table className="min-w-full text-left rounded-2xl overflow-hidden border-gray-200">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 border-b">Material ID</th>
                            <th className="px-4 py-2 border-b">Description</th>
                            <th className="px-4 py-2 border-b">Type</th>
                            <th className="px-4 py-2 border-b">Stock</th>
                            <th className="px-4 py-2 border-b">Unit Price</th>
                            <th className="px-4 py-2 border-b">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.map((material) => (
                            <tr key={material.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border-b">
                                    {material.id}
                                </td>
                                <td className="px-4 py-2 border-b">
                                    {material.description}
                                </td>
                                <td className="px-4 py-2 border-b">
                                    {material.type}
                                </td>
                                <td className="px-4 py-2 border-b">
                                    {material.stock}
                                </td>
                                <td className="px-4 py-2 border-b">
                                    ${material.price}
                                </td>
                                <td className="px-4 py-2 border-b">
                                    {material.status}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
