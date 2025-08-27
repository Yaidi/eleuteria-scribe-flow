import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea.tsx";
import { IWorldElement } from "@/types/sections.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/config.ts";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Button } from "@/components/ui/button.tsx";
import { addWorldElement, removeWorldElement, updateWorldElement } from "@/store";

const World = () => {
  const { world } = useSelector((state: RootState) => state.sections.world);
  const dispatch = useDispatch<AppDispatch>();

  const add = (id: number) => {
    dispatch(addWorldElement(id));
  };

  const update = (worldElement: Partial<IWorldElement>) => {
    dispatch(updateWorldElement(worldElement));
  };

  const remove = (id: number) => {
    dispatch(removeWorldElement(id));
  };
  if (!world) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>World Building</CardTitle>
        <Button onClick={() => add(world.id)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Element
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {world.worldElements.map((element) => (
            <div key={element.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div>
                    <Label>Name</Label>
                    <Input
                      name="title"
                      value={element.name}
                      onChange={(e) => update({ name: e.target.value, id: element.id })}
                      placeholder="Element title"
                    />
                  </div>
                </div>
                <Button
                  data-testid={`btn-remove-world-el-${element.id}`}
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(element.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  name="description"
                  value={element.description}
                  onChange={(e) => update({ id: element.id, description: e.target.value })}
                  placeholder="Describe this world element in detail..."
                />
              </div>
            </div>
          ))}
          {world.worldElements.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No world elements added yet. Click "Add Element" to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default World;
