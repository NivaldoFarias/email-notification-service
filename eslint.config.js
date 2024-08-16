import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{
		ignores: [".sst/", "types/", "**/*/sst-env.d.ts"],
	},
	{
		languageOptions: {
			globals: globals.node,
		},
		files: ["*.cjs"],
	},
	eslint.configs.recommended,
	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	{
		plugins: {
			"@typescript-eslint": tseslint.plugin,
		},
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: true,
			},
		},
		rules: {
			"@typescript-eslint/no-namespace": "off",
			"@typescript-eslint/require-await": "off",
			"@typescript-eslint/no-unsafe-call": "off",
			"@typescript-eslint/no-unsafe-return": "off",
			"@typescript-eslint/no-unsafe-argument": "off",
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/triple-slash-reference": "off",
			"@typescript-eslint/no-unsafe-member-access": "off",
		},
	},
);
