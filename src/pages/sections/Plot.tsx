import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Plus, Trash2} from "lucide-react";
import {Textarea} from "@/components/ui/textarea.tsx";
import {IPlot} from "@/types/sections.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useSelector} from "react-redux";
import {RootState} from "@/store/config.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {addPlot, removePlot, updatePlot} from "@/store/sections/action.ts";

const Plot = () => {
    const { plots } = useSelector((state: RootState) => state.sections)

    const add = () => {
        const newPlot: IPlot = {
            id: Date.now().toString(),
            title: '',
            description: '',
            manuscriptReference: '',
            characters: []
        };
        addPlot(newPlot);
    };

    const update = (plot: Partial<IPlot>) => {
        updatePlot(plot)
    };

    const remove = (id: string) => {
        removePlot(id)
    };
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Plots</CardTitle>
                <Button onClick={add} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Plot
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {plots.map((plot) => (
                        <div key={plot.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <Label>Plot Title</Label>
                                    <Input
                                        name="title"
                                        value={plot.title}
                                        onChange={(e) => update({
                                            id: plot.id,
                                            title: e.target.value
                                        })}
                                        placeholder="Plot title"
                                    />
                                </div>
                                <Button variant="destructive" size="sm" onClick={() => remove(plot.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <Label>Description</Label>
                                    <Textarea
                                        name="description"
                                        value={plot.description}
                                        onChange={(e) => update({
                                            id: plot.id,
                                            description: e.target.value
                                        })}
                                        placeholder="Describe what happens in this plot..."
                                    />
                                </div>
                                <div>
                                    <Label>Manuscript Reference</Label>
                                    <Input
                                        name="manuscriptReference"
                                        value={plot.manuscriptReference}
                                        onChange={(e) => update({
                                            id: plot.id,
                                            manuscriptReference: e.target.value
                                        })}
                                        placeholder="Chapter/page reference where this plot occurs"
                                    />
                                </div>
                                <div>
                                    <Label>Characters Involved</Label>
                                    <Textarea
                                        name="characters"
                                        value={plot.characters.join(', ')}
                                        onChange={(e) => update({
                                            id: plot.id,
                                            characters: e.target.value.split(',').map((character) => character.trim()).filter(Boolean)
                                        })}
                                        placeholder="List characters involved in this plot (comma-separated)"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {plots.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                            No plots added yet. Click "Add Plot" to get started.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default Plot;
