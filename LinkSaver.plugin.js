/**
 * @name LinkSaver
 * @displayName LinkSaver
 * @authorId 557218928368156674
 * @website https://github.com/Serakoi/LinkSaver
 * @invite 7TK7Bbz
 */

const { link } = require("fs");

/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();
@else@*/

module.exports = (() => {
	const config = {
		info: {
			name: "LinkSaver",
			authors: [
				{
					name: "Seer",
					discord_id: "405126960902176768",
					github_username: "Serakoi"
				}
			],
			version: "0.0.2",
			description: "Save links so that you have easy access to them!",
			github: "https://github.com/Serakoi/LinkSaver"
		},
		changelog: [
			{
				title: "Woah, What's this?!",
				type: "added",
				items: [
					"Store your links locally!",
					"Add links to your private library!"
				]
			}
		]
	};

	return !global.ZeresPluginLibrary ? class {
		constructor() { this._config = config; }
		getName() { return config.info.name; }
		getAuthor() { return config.info.authors.map(a => a.name).join(", "); }
		getDescription() { return config.info.description; }
		getVersion() { return config.info.version; }
		load() {
			BdApi.showConfirmationModal("Library plugin is needed",
				[`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`], {
				confirmText: "Download",
				cancelText: "Cancel",
				onConfirm: () => {
					require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
						if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
						await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
					});
				}
			});
		}
		start() { }
		stop() { }
	} : (([Plugin, Api]) => {
		const plugin = (Plugin, Api) => {
			const { Settings, PluginUtilities, Patcher } = Api;
			const { SettingPanel, SettingGroup, SettingField, Textbox, Switch } = Settings;

			const targetElement = '.buttons-3JBrkn'
			const inputArea = '.slateTextArea-1Mkdgw div span span span'

			let windowIsOpen = false;

			// ? Button code
			const linkButton = `
			<button aria-label="LinkSaver" tabindex="0" type="button" class="button-38aScr da-button lookBlank-3eh9lL colorBrand-3pXr91 grow-q77ONN da-grow">
			<div class="contents-18-Yxp da-contents button-3AYNKb da-button button-318s1X da-button">
			<div class="buttonWrapper-1ZmCpA da-buttonWrapper" id="children" style="opacity: 1; transform: none;">
			LS
			</div>
			</div>
			</button>
			`
			let UserLinks = [];



			return class saveLinks extends Plugin {

				onStart() {
					PluginUtilities.addStyle(config.info.name + '-CSS',
						`
						@import url('https://raw.githubusercontent.com/Serakoi/LinkSaver/main/coreStyles.css');
						`
					);
					var script = document.createElement('script');
					script.type = 'text/javascript';
					script.id = config.info.name + '-SA'
					script.src = '//cdn.jsdelivr.net/npm/sweetalert2@10';

					var fun = document.createElement('script');
					fun.type = 'text/javascript';
					fun.id = config.info.name + '-FUN'
					fun.src = 'https://raw.githubusercontent.com/Serakoi/LinkSaver/main/fun.js';


					document.getElementsByTagName('head')[0].appendChild(script);

					// this.renderButton();
					setTimeout(() => {
						this.generateButton();
					}, 1000);

					async function _fetch_(url){
						const githubData = await fetch(url);
						return githubData;
					}

					async function _checkUpdate_(){
						// const data = await _fetch_('https://raw.githubusercontent.com/Serakoi/LinkSaver/main/main.config.json');
						// if(data.latestVersion !== config.info.version){
						// 	let isOpen = false;
						// 	if (!isOpen) {
						// 		isOpen = true;
						// 		Swal.fire({
						// 			title: 'Update required!',
						// 			text: `There is a new update for ${config.info.name}`,
						// 			icon: 'info',
						// 			showCancelButton: true,
						// 			confirmButtonText: 'View Links',
						// 			cancelButtonText: 'Create Link'
						// 		}).then((result) => {
						// 			if (result.isConfirmed) {

						// 			} else if (result.dismiss === Swal.DismissReason.cancel) {

						// 			}
						// 		});
						// 	}
						// }
					}
					_checkUpdate_();
				}

				onStop() {
					PluginUtilities.removeStyle(config.info.name + 'CSS');

					let btn = document.getElementById('btn-' + config.info.name);
					btn.remove();
				}

				onSwitch() {
					// TODO : Add listener for if the button is **NOT** there...
					this.generateButton();
				}

				renderButton() {
					// ? Display button
					// var tag = document.createElement("p");
					// var text = document.createTextNode("Tutorix is the best e-learning platform");
					// tag.appendChild(text);
					// document.querySelector(targetElement).appendChild(tag)
				}

				generateButton() {
					const button = document.createElement('div'),
						messageBtnSelect = document.querySelector(targetElement)

					// TODO : Create button class
					var btnClass;

					button.setAttribute('id', 'btn-' + config.info.name)

					messageBtnSelect.append(button);

					let btnAction = document.getElementById('btn-' + config.info.name);

					button.innerHTML = linkButton;

					btnAction.addEventListener('click', () => {
						this.openSelectionWindow();
					});
				}

				openSelectionWindow() {
					let windowState = false;
					if (windowIsOpen) {
						windowState = true;
					}

					// ? Select another to insert new link or to select existing
					Swal.fire({
						title: 'Select Option',
						text: "View/Create your links!",
						icon: 'info',
						showCancelButton: true,
						confirmButtonText: 'View Links',
						cancelButtonText: 'Create Link',
						reverseButtons: true
					}).then((result) => {
						if (result.isConfirmed) {
							let linkLib = ``;
							if (UserLinks.length == 0) {
								linkLib = `You don't have any links yet!`;
							} else {
								// TODO : Make it so that the user can send it.
								UserLinks.forEach(x => {
									linkLib = linkLib + `
										<a class="anchor-3Z-8Bb da-anchor anchorUnderlineOnHover-2ESHQB da-anchorUnderlineOnHover" title="${x}" href="${x}" rel="noreferrer noopener" target="_blank" role="button" tabindex="0" onclick="ls_useLink('${x}')">
										${x}
										</a>
									&nbsp;`;
								});
							}

							Swal.fire(
								'My Links',
								linkLib,
								'info'
							)
						} else if (
							/* Read more about handling dismissals below */
							result.dismiss === Swal.DismissReason.cancel
						) {
							Swal.fire({
								title: 'Submit new link',
								input: 'text',
								inputAttributes: {
								  autocapitalize: 'off'
								},
								showCancelButton: true,
								confirmButtonText: 'Submit',
								showLoaderOnConfirm: true,
								preConfirm: (link) => {
									// ? Do something with text
									UserLinks.push(link)
								},
								allowOutsideClick: () => !Swal.isLoading()
							  }).then((result) => {
								if (result.isConfirmed) {
									// ? Success
									Swal.fire({
										title: "Link saved!",
										icon: "success"
									})
								}
							})
						}
					})

				}

			};
		};

		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();