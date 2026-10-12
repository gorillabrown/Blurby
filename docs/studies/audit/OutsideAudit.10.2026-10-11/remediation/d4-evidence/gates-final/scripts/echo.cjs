// Print the argv a shell delivers to a native program: id, then the arguments as JSON.
const [id, ...args] = process.argv.slice(2);
process.stdout.write(id + " " + JSON.stringify(args) + "\n");
