import { Card } from "@/components/Card";

export default function Home() {
    return (
        <div className="flex flex-col gap-10 max-w-7xl">
            <div className="flex flex-1 flex-row gap-5">
                <div className="flex flex-1 flex-col gap-5">
                    <Card>
                        <p>Total Production</p>
                        <h1 className="text-3xl font-bold">100,000</h1>
                    </Card>
                    <Card>
                        <p>Efficiency Rate</p>
                        <h1 className="text-3xl font-bold">-100%</h1>
                    </Card>
                    <Card>
                        <p>Active Orders</p>
                        <h1 className="text-3xl font-bold">21</h1>
                    </Card>
                    <Card>
                        <p>Completed Orders</p>
                        <h1 className="text-3xl font-bold">21</h1>
                    </Card>
                </div>
                <div className="flex flex-col gap-5 justify-between">
                    <Card>
                        <p>Work Center Effiency</p>
                        <h1 className="text-3xl font-bold">idk chart here</h1>
                    </Card>
                    <Card>
                        <p>Production Trends</p>
                        <h1 className="text-3xl font-bold">idk chart here</h1>
                    </Card>
                </div>
            </div>
            <Card>
                <p>Production Trends</p>
                <h1 className="text-3xl font-bold">idk chart here</h1>
            </Card>
        </div>
    );
}
