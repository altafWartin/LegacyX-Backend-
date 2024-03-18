const TextOnGif = require("text-on-gif");
const generate = async () => {
  var gif = new TextOnGif({
    file_path: "new.gif",
  });

  gif.font_color = "#FF0000";
  gif.font_size = "60px";

  var buffer = await gif.textOnGif({
    text: "Made with Love ",
    write_path: "mrroger.gif",
  });
};

const date = Date.now();

console.log(date);
