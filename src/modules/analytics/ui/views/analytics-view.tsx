"use client"

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, FolderGit2, Activity, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
    BarChart,
    Bar,
    Cell,
    LabelList
} from "recharts";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0 },
};

const stagger = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.08 },
    },
};

export const AnalyticsView = () => {
    const trpc = useTRPC();
    const { data: stats, isLoading } = useQuery(trpc.analytics.getStats.queryOptions());

    if (isLoading) {
        return (
            <div className="flex w-full h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-muted-foreground" size={32} />
            </div>
        );
    }

    if (!stats) return null;

    const totalCategoriesCount = stats.usageByCategory.reduce((acc, curr) => acc + curr.count, 0);

    const renderTrend = (value: number, suffix = "%", isPercentagePoint = false) => {
        if (value === 0) return <span className="text-muted-foreground text-xs font-normal ml-2">No change</span>;

        const isPositive = value > 0;
        const Icon = isPositive ? TrendingUp : TrendingDown;
        const colorClass = isPositive ? "text-emerald-500" : "text-rose-500";
        const sign = isPositive ? "+" : "";

        return (
            <span className={cn("text-xs font-medium flex items-center ml-2", colorClass)}>
                <Icon className="h-3 w-3 mr-1" />
                {sign}{value}{suffix} {isPercentagePoint ? "pp" : ""} vs last month
            </span>
        );
    };

    return (
        <div className="relative w-full">
            <div className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl -z-10 dark:bg-primary/15" />

            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="flex flex-col max-w-5xl mx-auto w-full px-4 pb-16 space-y-8"
            >
                <motion.div variants={fadeUp} className="pt-8 md:pt-16 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border bg-card/70 backdrop-blur px-4 py-2 text-xs text-muted-foreground mb-4">
                        <Activity className="h-4 w-4" />
                        Analytics
                    </div>
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Analytics Dashboard</h1>
                    <p className="text-base md:text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
                        Insight-rich overview of your project generation and template usage.
                    </p>
                </motion.div>

                {/* Insights / Highlights Card */}
                {stats.mostUsedTemplates.length > 0 && (
                    <motion.div variants={fadeUp} className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/20 rounded-xl p-4 flex items-center justify-between shadow-sm transition-all hover:shadow-md">
                        <div>
                            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                                <Zap className="h-4 w-4" /> Highlight of the Month
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Your top generating blueprint is <strong className="text-foreground font-medium">{stats.mostUsedTemplates[0].name}</strong>, responsible for <strong className="text-foreground font-medium">{stats.mostUsedTemplates[0].percentage}%</strong> of your total usage volume.
                            </p>
                        </div>
                    </motion.div>
                )}

                <motion.div variants={fadeUp} className="grid gap-4 md:grid-cols-3">
                    {/* Total Projects Card */}
                    <Card className="border-border/40 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 text-muted-foreground pb-2">
                            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                            <FolderGit2 className="h-4 w-4 opacity-50" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end">
                                <div className="text-3xl font-bold tracking-tight">{stats.totalProjects}</div>
                                {renderTrend(stats.totalProjectsTrend)}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Success Rate Card */}
                    <Card className="border-border/40 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 text-muted-foreground pb-2">
                            <CardTitle className="text-sm font-medium">Generation Success</CardTitle>
                            <Activity className="h-4 w-4 opacity-50" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end">
                                <div className="text-3xl font-bold tracking-tight">{stats.successRate}%</div>
                                {renderTrend(stats.successRateTrend, "%", true)}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 30-Day Activity Card */}
                    <Card className="border-border/40 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 text-muted-foreground pb-2">
                            <CardTitle className="text-sm font-medium">30-Day Generations</CardTitle>
                            <Zap className="h-4 w-4 opacity-50" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end">
                                <div className="text-3xl font-bold tracking-tight">{stats.totalGenerations}</div>
                                {renderTrend(stats.totalGenerationsTrend)}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={fadeUp} className="grid gap-4 grid-cols-1 md:grid-cols-7">
                    <Card className="md:col-span-4 lg:col-span-5 border border-border/50 shadow-sm flex flex-col relative overflow-hidden bg-card/60 dark:bg-card/40">
                        <style>{`
                        .analytics-chart {
                            --success-line: #6366f1;
                            --success-fill: rgba(99, 102, 241, 0.25);
                            --fail-line: #f43f5e;
                            --fail-fill: rgba(244, 63, 94, 0.2);
                            --chart-grid: rgba(148, 163, 184, 0.25);
                            --chart-axis: #0f172a;
                            --tooltip-bg: hsl(var(--card));
                            --tooltip-border: hsl(var(--border));
                            --bar-primary: #0f172a;
                            --bar-secondary: #64748b;
                            --bar-bg: #f1f5f9;
                            --bar-text: #64748b;
                        }

                        .dark .analytics-chart {
                            --chart-grid: rgba(148, 163, 184, 0.15);
                            --chart-axis: #f8fafc;
                            --bar-primary: #f8fafc;
                            --bar-secondary: #94a3b8;
                            --bar-bg: #1e293b;
                            --bar-text: #cbd5e1;
                        }
                    `}</style>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/10 pointer-events-none" />
                        <CardHeader className="relative z-10">
                            <CardTitle className="flex items-center justify-between">
                                <span>Generations: Success vs Failure</span>
                                <Badge variant="secondary" className="font-normal border-border/50 shadow-sm">Last 30 Days</Badge>
                            </CardTitle>
                            <CardDescription>
                                Comparing successful outputs against failed generation attempts.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-0 pb-6 pr-6 pt-4 flex-1 min-h-[380px] relative z-10 analytics-chart">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={stats.creditsOverTime}
                                    margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="successFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--success-line)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--success-line)" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="failFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--fail-line)" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="var(--fail-line)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>

                                    <CartesianGrid
                                        vertical={false}
                                        stroke="var(--chart-grid)"
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: "var(--chart-axis)", fontSize: 12 }}
                                        dy={10}
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: "var(--chart-axis)", fontSize: 12 }}
                                    />

                                    <Tooltip
                                        cursor={{ stroke: "var(--chart-grid)", strokeWidth: 1 }}
                                        contentStyle={{
                                            background: "var(--tooltip-bg)",
                                            border: "1px solid var(--tooltip-border)",
                                            borderRadius: 8,
                                            fontSize: 13,
                                            color: "var(--chart-axis)",
                                        }}
                                        itemStyle={{ color: "var(--chart-axis)" }}
                                        labelStyle={{ color: "var(--chart-axis)" }}
                                    />

                                    <Area
                                        type="monotone"
                                        dataKey="failed"
                                        name="Failed"
                                        stroke="var(--fail-line)"
                                        strokeWidth={2}
                                        fill="url(#failFill)"
                                        dot={false}
                                        activeDot={{ r: 5 }}
                                    />

                                    <Area
                                        type="monotone"
                                        dataKey="successful"
                                        name="Successful"
                                        stroke="var(--success-line)"
                                        strokeWidth={2.5}
                                        fill="url(#successFill)"
                                        dot={false}
                                        activeDot={{ r: 6 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Usage Breakdown BarChart */}
                    <Card className="col-span-1 md:col-span-3 lg:col-span-2 border-border/40 shadow-sm flex flex-col">
                        <CardHeader>
                            <CardTitle>Usage Breakdown</CardTitle>
                            <CardDescription>Generations by category</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-4 flex-1 min-h-[350px] analytics-chart">
                            {stats.usageByCategory.length === 0 ? (
                                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No data</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={stats.usageByCategory}
                                        layout="vertical"
                                        margin={{ top: 0, right: 36, left: 0, bottom: 0 }}
                                    >
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="category"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fill: "var(--chart-axis)",
                                                fontSize: 12,
                                                fontWeight: 500,
                                            }}
                                            width={90}
                                        />

                                        <Tooltip
                                            cursor={{ fill: "transparent" }}
                                            contentStyle={{
                                                background: "var(--tooltip-bg)",
                                                border: "1px solid var(--tooltip-border)",
                                                borderRadius: 8,
                                                fontSize: 13,
                                                color: "var(--chart-axis)",
                                            }}
                                            itemStyle={{ color: "var(--chart-axis)" }}
                                            labelStyle={{ color: "var(--chart-axis)" }}
                                        />

                                        <Bar
                                            dataKey="count"
                                            barSize={22}
                                            radius={[0, 6, 6, 0]}
                                            background={{
                                                fill: "var(--bar-bg)",
                                                radius: 6,
                                            }}
                                        >
                                            <LabelList
                                                position="right"
                                                formatter={(value: number) =>
                                                    `${Math.round((value / totalCategoriesCount) * 100)}%`
                                                }
                                                fill="var(--bar-text)"
                                                fontSize={12}
                                                fontWeight={500}
                                            />

                                            {stats.usageByCategory.map((_, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={index === 0 ? "var(--bar-primary)" : "var(--bar-secondary)"}
                                                    fillOpacity={index === 0 ? 1 : 0.85}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Bottom Row */}
                <motion.div variants={fadeUp} className="grid gap-4 grid-cols-1 md:grid-cols-7">
                    {/* Recent Activity */}
                    <Card className="md:col-span-4 border-border/40 shadow-sm">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Your latest AI generation tasks.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stats.recentActivity.length === 0 ? (
                                <div className="flex items-center justify-center py-8 text-center text-muted-foreground">
                                    <p>No recent activity found.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {stats.recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border border-transparent transition-colors hover:bg-muted/30 hover:border-border/40">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">{activity.name}</p>
                                                <p className="text-xs text-muted-foreground">{activity.templateName}</p>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className="text-xs text-muted-foreground hidden sm:inline-block">
                                                    {new Date(activity.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "font-normal",
                                                        activity.status === "Completed" ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10" :
                                                            activity.status === "Failed" ? "text-rose-500 border-rose-500/30 bg-rose-500/10" :
                                                                "text-blue-500 border-blue-500/30 bg-blue-500/10"
                                                    )}
                                                >
                                                    {activity.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Expanded Top Templates */}
                    <Card className="md:col-span-3 border-border/40 shadow-sm">
                        <CardHeader>
                            <CardTitle>Top Templates</CardTitle>
                            <CardDescription>Your most frequently generated blueprints.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stats.mostUsedTemplates.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground h-full">
                                    <p>No template usage data yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {stats.mostUsedTemplates.map((template, index) => (
                                        <div key={template.id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className={cn(
                                                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                                                        index === 0 ? "bg-primary text-primary-foreground" :
                                                            index === 1 ? "bg-muted-foreground/20 text-foreground" :
                                                                "bg-muted text-muted-foreground"
                                                    )}>
                                                        {index + 1}
                                                    </div>
                                                    <span className="text-sm font-medium">{template.name}</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {template.percentage}% <span className="text-xs opacity-50">({template.count})</span>
                                                </div>
                                            </div>
                                            <Progress value={template.percentage} className={cn("h-1.5", index === 0 ? "" : "[&>div]:bg-muted-foreground/40")} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
};
