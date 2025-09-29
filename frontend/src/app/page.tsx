import Link from "next/link";
import Card from "@/components/Card";
import {
  LayoutDashboard,
  Package,
  Wrench,
  LucideApple,
  Calculator,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      title: "MRP Planning",
      description: "Optimize material requirements and planning processes",
      icon: Calculator,
      color: "from-purple-500 to-purple-600",
      href: "/mrp",
    },
    {
      title: "Real-time Dashboard",
      description: "Monitor production metrics and KPIs in real-time",
      icon: LayoutDashboard,
      color: "from-blue-500 to-blue-600",
      href: "/dashboard",
    },
    {
      title: "Production Orders",
      description: "Manage and track production orders efficiently",
      icon: Package,
      color: "from-green-500 to-green-600",
      href: "/orders",
    },
    {
      title: "Materials Management",
      description: "Comprehensive inventory and material tracking",
      icon: Wrench,
      color: "from-orange-500 to-orange-600",
      href: "/materials",
    },
  ];

  return (
    <div className="space-y-16">
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-primary to-primary/80 p-4 rounded-2xl">
              <LucideApple className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            SAP Manufacturing System
          </h1>
        </div>
      </section>

      <section className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link href={feature.href} key={index}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-br ${feature.color} group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
