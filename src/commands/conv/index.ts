import { Command,Flags } from "@oclif/core";
import * as fs from "fs";
import * as path from "path";
import { jsonToGo } from "../../json-to-go";


interface ConvFlags{
  json:string,
  go:string,
  package:string,
  struct:string,
  comment:string
}

export default class Conv extends Command {
  static description =
    "Converts json from source file to struct and writes it in the destination file";

  static flags = {
    json:Flags.string({
      char:"J",
      required:true,
      description:"path to JSON file",
      summary:"path to the JSON source file"
    }),
    go:Flags.string({
      char:"G",
      required:true,
      description:"path to GO file",
      summary:"path to the go file where the struct will be written"
    }),
    package:Flags.string({
      char:"P",
      required:false,
      description:"Package name",
      summary:"Name of the package to be imported",
      default:"autogenerated"
    }),
    struct:Flags.string({
      char:"S",
      required:false,
      description:"Parent struct name",
      summary:"Name of the parent struct",
      default:"Autogenerated"
    }),
    comment:Flags.string({
      char:"C",
      required:false,
      description:"Comment",
      summary:"Comment to add in the struct",
      default:""
    })
  }

  async run(): Promise<void> {
    const {flags}:{flags:ConvFlags} = await this.parse(Conv);

    const fullFromPath = path.resolve(flags.json);
    let fullToPath = path.resolve(flags.go);

    if(!fs.existsSync(fullFromPath)){
      this.error("JSON path "+fullFromPath+" does not exist")
    }

    const buffer = fs.readFileSync(fullFromPath);

    // Convert json to struct
    const { go, error } = jsonToGo(
      buffer.toString(),
      flags.struct,
      true,
      false,
      false,
      flags.comment,
      flags.package.toLowerCase()
    );
    if (error) {
      console.error(error);
      process.exit(1);
    }
    // Write to dest
    if (!fullToPath.endsWith(".go")) {
      fullToPath += ".go";
    }
    fs.writeFileSync(fullToPath, go);
    console.log(`Struct written succesfully 🚀 to  ${fullToPath}`);
  }
}
