import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@radix-ui/react-select";
import {Plus, Trash2} from "lucide-react";
import {Textarea} from "@/components/ui/textarea.tsx";
import {IWorld} from "@/types/sections.tsx";
import {useSelector} from "react-redux";
import {RootState} from "@/store/config.tsx";
import {addWorld, removeWorld, updateInfoWorld} from "@/store/sections/action.ts";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Button} from "@/components/ui/button.tsx";

const World = () => {
    const { world } = useSelector((state: RootState) => state.sections)

    const addWorldElement = () => {
        const newElement: IWorld = {
            id: Date.now().toString(),
            category: 'culture',
            title: '',
            description: ''
        };
        addWorld(newElement);
    };

    const updateWorldElement = (world: Partial<IWorld>) => {
        updateInfoWorld(world)
    };

    const removeWorldElement = (id: string) => {
        removeWorld(id)
    };

    return  (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>World Building</CardTitle>
                <Button onClick={addWorldElement} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Element
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {world.map((element) => (
                        <div key={element.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-4">
                                <div className="grid grid-cols-2 gap-4 flex-1">
                                    <div>
                                        <Label>Category</Label>
                                        <Select name="category" value={element.category} onValueChange={(value) => updateWorldElement({
                                            id: element.id,
                                            category: value
                                        })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="culture">Culture</SelectItem>
                                                <SelectItem value="language">Language</SelectItem>
                                                <SelectItem value="tradition">Tradition</SelectItem>
                                                <SelectItem value="weather">Weather</SelectItem>
                                                <SelectItem value="geography">Geography</SelectItem>
                                                <SelectItem value="politics">Politics</SelectItem>
                                                <SelectItem value="religion">Religion</SelectItem>
                                                <SelectItem value="technology">Technology</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Title</Label>
                                        <Input
                                            name="title"
                                            value={element.title}
                                            onChange={(e) => updateWorldElement({title: e.target.value, id: element.id})}
                                            placeholder="Element title"
                                        />
                                    </div>
                                </div>
                                <Button variant="destructive" size="sm" onClick={() => removeWorldElement(element.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    name="description"
                                    value={element.description}
                                    onChange={(e) => updateWorldElement({id: element.id, description: e.target.value})}
                                    placeholder="Describe this world element in detail..."
                                />
                            </div>
                        </div>
                    ))}
                    {world.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                            No world elements added yet. Click "Add Element" to get started.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default World;
