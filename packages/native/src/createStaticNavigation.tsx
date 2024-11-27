import {
  createComponentForStaticNavigation,
  createPathConfigForStaticNavigation,
  type NavigationContainerRef,
  type ParamListBase,
  type StaticNavigation,
} from '@react-navigation/core';
import * as React from 'react';

import { NavigationContainer } from './NavigationContainer';
import type { LinkingOptions } from './types';

type Props = Omit<
  React.ComponentProps<typeof NavigationContainer>,
  'linking' | 'children'
> & {
  /**
   * Options for deep linking.
   */
  linking?: Omit<LinkingOptions<ParamListBase>, 'config' | 'enabled'> & {
    /**
     * Whether deep link handling should be enabled.
     * Defaults to `true` if any `linking` options are specified, `false` otherwise.
     *
     * When 'auto' is specified, all leaf screens will get a autogenerated path.
     * The generated path will be a kebab-case version of the screen name.
     * This can be overridden for specific screens by specifying `linking` for the screen.
     */
    enabled?: 'auto' | true | false;
    /**
     * Additional configuration
     */
    config?: Omit<
      NonNullable<LinkingOptions<ParamListBase>['config']>,
      'screens'
    >;
  };
};

/**
 * Create a navigation component from a static navigation config.
 * The returned component is a wrapper around `NavigationContainer`.
 *
 * @param tree Static navigation config.
 * @returns Navigation component to use in your app.
 */
export function createStaticNavigation(tree: StaticNavigation<any, any, any>) {
  const Component = createComponentForStaticNavigation(tree, 'RootNavigator');

  function Navigation(
    { linking, ...rest }: Props,
    ref: React.Ref<NavigationContainerRef<ParamListBase>>
  ) {
    const linkingConfig = React.useMemo(() => {
      // if (!tree.config.screens) return;

      const screens = createPathConfigForStaticNavigation(
        tree,
        { initialRouteName: linking?.config?.initialRouteName },
        linking?.enabled === 'auto'
      );

      if (!screens) return;

      return {
        path: linking?.config?.path,
        initialRouteName: linking?.config?.initialRouteName,
        screens,
      };
    }, [
      linking?.enabled,
      linking?.config?.path,
      linking?.config?.initialRouteName,
    ]);

    const memoizedLinking = React.useMemo(() => {
      if (!linking) {
        return undefined;
      }

      const enabled =
        typeof linking.enabled === 'boolean'
          ? linking.enabled
          : linkingConfig?.screens != null;

      return {
        ...linking,
        enabled,
        config: linkingConfig,
      };
    }, [linking, linkingConfig]);

    if (linking?.enabled === true && linkingConfig?.screens == null) {
      throw new Error(
        'Linking is enabled but no linking configuration was found for the screens.\n\n' +
          'To solve this:\n' +
          "- Specify a 'linking' property for the screens you want to link to.\n" +
          "- Or set 'linking.enabled' to 'auto' to generate paths automatically.\n\n" +
          'See usage guide: https://reactnavigation.org/docs/static-configuration#linking'
      );
    }

    return (
      <NavigationContainer {...rest} ref={ref} linking={memoizedLinking}>
        <Component />
      </NavigationContainer>
    );
  }

  return React.forwardRef(Navigation);
}
