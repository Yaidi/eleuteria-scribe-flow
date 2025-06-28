import {Label} from "recharts";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Trash2} from "lucide-react";
import {Textarea} from "@/components/ui/textarea.tsx";
import {ICharacter, PriorityType} from "@/types/sections.ts";
import React from "react";
import {removeCharacter, updateInfoCharacter} from "@/store";
import {useDispatch} from "react-redux";

interface FormsCharactersProps {
    character: ICharacter
}

const FormsCharacters: React.FC<FormsCharactersProps> = ({ character}) => {
    const dispatch = useDispatch()
    const update = (charachter: Partial<ICharacter>) => {
        dispatch(updateInfoCharacter(charachter))
    };

    const remove = (id: string) => {
        dispatch(removeCharacter(id))
    };

    return(
        <div key={character.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
                <div className="grid grid-cols-2 gap-4 flex-1">
                    <div>
                        <Label>Name</Label>
                        <Input
                            name="name"
                            value={character.name}
                            onChange={(e) => update({id: character.id, name: e.target.value})}
                            placeholder="Character name"
                        />
                    </div>
                    <div>
                        <Label>Importance</Label>
                        <Select name="importance" value={character.importance} onValueChange={(value: PriorityType) => update({
                            id: character.id,
                            importance: value
                        })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="main">Main Character</SelectItem>
                                <SelectItem value="secondary">Secondary Character</SelectItem>
                                <SelectItem value="minor">Minor Character</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => remove(character.id)}>
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
            <div className="space-y-4">
                <div>
                    <Label>Characteristics</Label>
                    <Textarea
                        name="characteristics"
                        value={character.characteristics}
                        onChange={(e) => update({id: character.id, characteristics: e.target.value})}
                        placeholder="Physical appearance, personality traits..."
                    />
                </div>
                <div>
                    <Label>About Character</Label>
                    <Textarea
                        name="about"
                        value={character.about}
                        onChange={(e) => update({
                            id: character.id,
                            about: e.target.value
                        })}
                        placeholder="Background story, motivations, role in the story..."
                    />
                </div>
            </div>
        </div>
    )
}

export default FormsCharacters