import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {ESections} from "@/types/sections.tsx";
import React from "react";

interface ManuscriptProps {
    section: ESections;
}

const Manuscript: React.FC<ManuscriptProps> = ({section}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="capitalize">{section.toString()}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-8 text-slate-500">
                    <p>This section is coming soon!</p>
                    <p className="text-sm mt-2">The {section.toString()} workspace will be available in the next update.</p>
                </div>
            </CardContent>
        </Card>
    );
}

export default Manuscript;